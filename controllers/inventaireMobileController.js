const { Inventaire, User, Desk, Section, Equipment } = require('../models');

// Get all non-deleted inventories for the current user
exports.getMyInventaires = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventaires = await Inventaire.findAll({
      where: { AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    // Add equipment count and emplacement
    const enriched = await Promise.all(inventaires.map(async inv => {
      let equipCount = 0;
      let emplacement = null;

      if (inv.PlacementType === 'desk' && inv.desk) {
        equipCount = await Equipment.count({ where: { desk_id: inv.desk.id, is_deleted: false } });
        emplacement = inv.desk.name;
      } else if (inv.PlacementType === 'section' && inv.section) {
        equipCount = await Equipment.count({ where: { section_id: inv.section.id, is_deleted: false } });
        emplacement = inv.section.name;
      }

      return {
        idInventaire: inv.idInventaire,
        inventoryType: inv.inventoryType,
        startDate: inv.startDate,
        status: inv.status,
        priority: inv.priority,
        placementType: inv.PlacementType,
        emplacement,
        equipCount,
        associatedUser: inv.associatedUser
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get a specific inventory by ID
exports.getMyInventaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const inventaire = await Inventaire.findOne({
      where: { idInventaire: id, AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ]
    });

    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found or access denied' });

    let equipCount = 0;
    let emplacement = null;
    if (inventaire.PlacementType === 'desk' && inventaire.desk) {
      equipCount = await Equipment.count({ where: { desk_id: inventaire.desk.id, is_deleted: false } });
      emplacement = inventaire.desk.name;
    } else if (inventaire.PlacementType === 'section' && inventaire.section) {
      equipCount = await Equipment.count({ where: { section_id: inventaire.section.id, is_deleted: false } });
      emplacement = inventaire.section.name;
    }

    res.json({
      idInventaire: inventaire.idInventaire,
      inventoryType: inventaire.inventoryType,
      startDate: inventaire.startDate,
      status: inventaire.status,
      priority: inventaire.priority,
      placementType: inventaire.PlacementType,
      emplacement,
      equipCount,
      associatedUser: inventaire.associatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Create inventory
exports.createMyInventaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, PlacementType, idPlacement, priority, inventoryType } = req.body;

    if (!startDate || !PlacementType || !idPlacement || !inventoryType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate placement
    if (PlacementType === 'desk') {
      const desk = await Desk.findByPk(idPlacement);
      if (!desk) return res.status(400).json({ message: 'Desk does not exist' });
    } else if (PlacementType === 'section') {
      const section = await Section.findByPk(idPlacement);
      if (!section) return res.status(400).json({ message: 'Section does not exist' });
    } else {
      return res.status(400).json({ message: 'Invalid placement type' });
    }

    const inventaire = await Inventaire.create({
      startDate,
      AssociatedTo: userId,
      PlacementType,
      idPlacement,
      priority: priority || 'medium',
      inventoryType
    });

    res.status(201).json({ message: 'Inventaire created successfully', inventaire });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update inventory
exports.updateMyInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const inventaire = await Inventaire.findOne({ where: { idInventaire: id, AssociatedTo: userId, isDeleted: false } });
    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found or access denied' });

    const { startDate, PlacementType, idPlacement, priority, inventoryType, status } = req.body;

    await inventaire.update({ startDate, PlacementType, idPlacement, priority, inventoryType, status });

    res.json({ message: 'Inventaire updated successfully', inventaire });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Inventory statistics
exports.getMyInventaireStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Inventaire.count({ where: { AssociatedTo: userId, isDeleted: false } });
    const pending = await Inventaire.count({ where: { AssociatedTo: userId, status: 'Pending', isDeleted: false } });
    const inProgress = await Inventaire.count({ where: { AssociatedTo: userId, status: 'Started', isDeleted: false } });
    const completed = await Inventaire.count({ where: { AssociatedTo: userId, status: 'Done', isDeleted: false } });

    res.json({ total, pending, inProgress, completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// Enhanced status update with validation
exports.updateMyInventaireStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Validate status value
    const validStatuses = ['Pending', 'Started', 'Done', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    // Find the inventory
    const inventaire = await Inventaire.findOne({ 
      where: { idInventaire: id, AssociatedTo: userId, isDeleted: false } 
    });
    
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found or access denied' });
    }

    // Optional: Add business logic for status transitions
    const currentStatus = inventaire.status;
    
    // Example: Prevent going backwards in status (optional)
    const statusOrder = ['Pending', 'Started', 'Done', 'Cancelled'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(status);
    
    if (newIndex < currentIndex && status !== 'Cancelled') {
      return res.status(400).json({ 
        message: `Cannot change status from ${currentStatus} to ${status}` 
      });
    }

    // Update the status
    await inventaire.update({ status });

    // Return the updated inventory
    const updatedInventaire = await Inventaire.findByPk(inventaire.idInventaire, {
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ]
    });

    // Format response
    let equipCount = 0;
    let emplacement = null;
    if (updatedInventaire.PlacementType === 'desk' && updatedInventaire.desk) {
      equipCount = await Equipment.count({ where: { desk_id: updatedInventaire.desk.id, is_deleted: false } });
      emplacement = updatedInventaire.desk.name;
    } else if (updatedInventaire.PlacementType === 'section' && updatedInventaire.section) {
      equipCount = await Equipment.count({ where: { section_id: updatedInventaire.section.id, is_deleted: false } });
      emplacement = updatedInventaire.section.name;
    }

    res.json({
      message: 'Inventaire status updated successfully',
      inventaire: {
        idInventaire: updatedInventaire.idInventaire,
        inventoryType: updatedInventaire.inventoryType,
        startDate: updatedInventaire.startDate,
        status: updatedInventaire.status,
        priority: updatedInventaire.priority,
        placementType: updatedInventaire.PlacementType,
        emplacement,
        equipCount,
        associatedUser: updatedInventaire.associatedUser
      }
    });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: err.message });
  }
};
