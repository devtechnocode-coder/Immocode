const { Inventaire, User, Desk, Section, Equipment } = require('../models');
const { Op } = require('sequelize');

// Get all inventories for current user (optimized)
exports.getMyInventaires = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventaires = await Inventaire.findAll({
      where: { AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        // Include Desk and Section through Equipment
        {
          model: Equipment,
          as: 'equipment',
          required: false,
          where: { is_deleted: false },
          include: [
            { model: Desk, as: 'desk', attributes: ['id', 'name'] },
            { model: Section, as: 'section', attributes: ['id', 'name'] }
          ]
        },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    // Map inventories to include equipment count and emplacement
    const results = inventaires.map(inv => {
      const equipmentList = inv.equipment || [];
      const emplacement = inv.PlacementType === 'desk' ? inv.desk?.name : inv.section?.name;

      return {
        idInventaire: inv.idInventaire,
        name: inv.inventoryType,
        status: inv.status,
        startDate: inv.startDate,
        priority: inv.priority,
        PlacementType: inv.PlacementType,
        emplacement,
        equipmentCount: equipmentList.length,
        equipmentList: equipmentList.map(eq => ({
          id: eq.id,
          name: eq.name,
          special_identifier: eq.special_identifier,
          buying_price: eq.buying_price,
          date_of_purchase: eq.date_of_purchase,
          current_ammortissement: eq.current_ammortissement,
          state: eq.state,
          desk: eq.desk?.name || null,
          section: eq.section?.name || null
        })),
        associatedUser: inv.associatedUser
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get single inventory by ID (optimized)
exports.getMyInventaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const inventaire = await Inventaire.findOne({
      where: { idInventaire: id, AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        {
          model: Equipment,
          as: 'equipment',
          required: false,
          where: { is_deleted: false },
          include: [
            { model: Desk, as: 'desk', attributes: ['id', 'name'] },
            { model: Section, as: 'section', attributes: ['id', 'name'] }
          ]
        },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ]
    });

    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found or you do not have access' });
    }

    const equipmentList = inventaire.equipment || [];
    const emplacement = inventaire.PlacementType === 'desk' ? inventaire.desk?.name : inventaire.section?.name;

    res.json({
      idInventaire: inventaire.idInventaire,
      name: inventaire.inventoryType,
      status: inventaire.status,
      startDate: inventaire.startDate,
      priority: inventaire.priority,
      PlacementType: inventaire.PlacementType,
      emplacement,
      equipmentCount: equipmentList.length,
      equipmentList: equipmentList.map(eq => ({
        id: eq.id,
        name: eq.name,
        special_identifier: eq.special_identifier,
        buying_price: eq.buying_price,
        date_of_purchase: eq.date_of_purchase,
        current_ammortissement: eq.current_ammortissement,
        state: eq.state,
        desk: eq.desk?.name || null,
        section: eq.section?.name || null
      })),
      associatedUser: inventaire.associatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Mobile user - Create new inventory
exports.createMyInventaire = async (req, res) => {
  try {
    const required = ['startDate', 'PlacementType', 'idPlacement', 'inventoryType'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }

    const userId = req.user.id;
    const { startDate, PlacementType, idPlacement, priority, inventoryType } = req.body;

    // Validate placement exists based on type
    if (PlacementType === 'desk') {
      const desk = await Desk.findByPk(idPlacement);
      if (!desk) {
        return res.status(400).json({ message: 'The indicated desk does not exist' });
      }
    } else if (PlacementType === 'section') {
      const section = await Section.findByPk(idPlacement);
      if (!section) {
        return res.status(400).json({ message: 'The indicated section does not exist' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid placement type' });
    }

    const inventaire = await Inventaire.create({
      startDate,
      AssociatedTo: userId, // Automatically associate with current user
      PlacementType,
      idPlacement,
      priority: priority || 'medium',
      inventoryType
    });

    res.status(201).json({ message: 'Inventaire created successfully', inventaire });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mobile user - Update own inventory
exports.updateMyInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const inventaire = await Inventaire.findOne({ 
      where: { 
        idInventaire: id, 
        AssociatedTo: userId,
        isDeleted: false 
      }
    });
    
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found or you do not have access' });
    }

    const { startDate, PlacementType, idPlacement, priority, inventoryType, status } = req.body;

    // Validate placement if type or id changed
    if ((PlacementType && PlacementType !== inventaire.PlacementType) || 
        (idPlacement && idPlacement !== inventaire.idPlacement)) {
      const finalPlacementType = PlacementType || inventaire.PlacementType;
      const finalIdPlacement = idPlacement || inventaire.idPlacement;

      if (finalPlacementType === 'desk') {
        const desk = await Desk.findByPk(finalIdPlacement);
        if (!desk) {
          return res.status(400).json({ message: 'The indicated desk does not exist' });
        }
      } else if (finalPlacementType === 'section') {
        const section = await Section.findByPk(finalIdPlacement);
        if (!section) {
          return res.status(400).json({ message: 'The indicated section does not exist' });
        }
      }
    }

    await inventaire.update({
      startDate,
      PlacementType,
      idPlacement,
      priority,
      inventoryType,
      status
    });

    res.json({ message: 'Inventaire updated successfully', inventaire });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mobile user - Get inventory statistics
exports.getMyInventaireStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalInventaires = await Inventaire.count({ 
      where: { 
        AssociatedTo: userId, 
        isDeleted: false 
      }
    });
    
    const pendingInventaires = await Inventaire.count({ 
      where: { 
        AssociatedTo: userId, 
        status: 'Pending',
        isDeleted: false 
      }
    });
    
    const inProgressInventaires = await Inventaire.count({ 
      where: { 
        AssociatedTo: userId, 
        status: 'Started',
        isDeleted: false 
      }
    });
    
    const completedInventaires = await Inventaire.count({ 
      where: { 
        AssociatedTo: userId, 
        status: 'Done',
        isDeleted: false 
      }
    });

    res.json({
      total: totalInventaires,
      pending: pendingInventaires,
      inProgress: inProgressInventaires,
      completed: completedInventaires
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};