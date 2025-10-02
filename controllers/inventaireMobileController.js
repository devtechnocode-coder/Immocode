const { Inventaire, User, Desk, Section, Equipment } = require('../models');

// Mobile user - Get all non-deleted inventories associated with the current user
exports.getMyInventaires = async (req, res) => {
  try {
    // Assuming user ID is available from auth middleware (req.user.id)
    const userId = req.user.id;
    
    const inventaires = await Inventaire.findAll({ 
      where: { 
        AssociatedTo: userId, 
        isDeleted: false 
      },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          required: false,
          where: { PlacementType: 'desk' }
        },
        {
          model: Section,
          as: 'section',
          required: false,
          where: { PlacementType: 'section' }
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mobile user - Get specific inventory by ID (only if associated with current user)
exports.getMyInventaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const inventaire = await Inventaire.findOne({ 
      where: { 
        idInventaire: id, 
        AssociatedTo: userId,
        isDeleted: false 
      },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          required: false,
          where: { PlacementType: 'desk' }
        },
        {
          model: Section,
          as: 'section',
          required: false,
          where: { PlacementType: 'section' }
        }
      ]
    });
    
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found or you do not have access' });
    }
    
    res.json(inventaire);
  } catch (err) {
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