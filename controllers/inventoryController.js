const { Inventaire, User, Desk, Section, Equipment } = require('../models');

exports.createInventaire = async (req, res) => {
  try {
    const required = ['startDate', 'AssociatedTo', 'PlacementType', 'idPlacement', 'inventoryType'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }

    const { startDate, AssociatedTo, PlacementType, idPlacement, priority, inventoryType } = req.body;

    // Validate user exists
    const user = await User.findByPk(AssociatedTo);
    if (!user) {
      return res.status(400).json({ message: 'The indicated user does not exist' });
    }

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
      AssociatedTo,
      PlacementType,
      idPlacement,
      priority: priority || 'medium',
      inventoryType
    });

    res.status(201).json({ message: 'Inventaire created', inventaire });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const inventaire = await Inventaire.findByPk(id);
    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found' });

    const { startDate, AssociatedTo, PlacementType, idPlacement, priority, inventoryType, status } = req.body;

    // Validate user if provided
    if (AssociatedTo && AssociatedTo !== inventaire.AssociatedTo) {
      const user = await User.findByPk(AssociatedTo);
      if (!user) {
        return res.status(400).json({ message: 'The indicated user does not exist' });
      }
    }

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
      AssociatedTo,
      PlacementType,
      idPlacement,
      priority,
      inventoryType,
      status
    });

    res.json({ message: 'Inventaire updated', inventaire });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const inventaire = await Inventaire.findByPk(id);
    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found' });
    
    await inventaire.update({ isDeleted: true, deletedAt: new Date() });
    res.json({ message: 'Inventaire soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllInventaires = async (req, res) => {
  try {
    const inventaires = await Inventaire.findAll({ 
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInventaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventaire = await Inventaire.findOne({ 
      where: { idInventaire: id, isDeleted: false },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          required: false
        },
        {
          model: Section,
          as: 'section',
          required: false
        }
      ]
    });
    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found' });
    res.json(inventaire);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInventaireByName = async (req, res) => {
  try {
    const { name } = req.params;
    const inventaires = await Inventaire.findAll({ 
      where: { Name: name, isDeleted: false },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    if (!inventaires.length) return res.status(404).json({ message: 'No inventaire found with this name' });
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInventaireByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const inventaires = await Inventaire.findAll({ 
      where: { AssociatedTo: userId, isDeleted: false },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInventaireByPlacement = async (req, res) => {
  try {
    const { placementType, placementId } = req.params;
    
    if (!['desk', 'section'].includes(placementType)) {
      return res.status(400).json({ message: 'Invalid placement type' });
    }

    // Validate placement exists
    if (placementType === 'desk') {
      const desk = await Desk.findByPk(placementId);
      if (!desk) return res.status(404).json({ message: 'Desk not found' });
    } else {
      const section = await Section.findByPk(placementId);
      if (!section) return res.status(404).json({ message: 'Section not found' });
    }

    const inventaires = await Inventaire.findAll({ 
      where: { 
        PlacementType: placementType, 
        idPlacement: placementId,
        isDeleted: false 
      },
      include: [
        {
          model: User,
          as: 'associatedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countAllInventaires = async (req, res) => {
  try {
    const count = await Inventaire.count({ where: { isDeleted: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countInventairesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const count = await Inventaire.count({ 
      where: { AssociatedTo: userId, isDeleted: false } 
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedInventaires = async (req, res) => {
  try {
    const inventaires = await Inventaire.findAll({ where: { isDeleted: true } });
    res.json(inventaires);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const inventaire = await Inventaire.findByPk(id, { paranoid: false });
    
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found' });
    }
    
    if (!inventaire.isDeleted) {
      return res.status(400).json({ message: 'Inventaire is not deleted' });
    }
    
    await inventaire.update({
      isDeleted: false,
      deletedAt: null
    });
    
    res.json({ message: 'Inventaire undeleted successfully', inventaire });
  } catch (err) {
    console.error('Error in undeleteInventaire:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.recalculateEquipmentCount = async (req, res) => {
  try {
    const { id } = req.params;
    const inventaire = await Inventaire.findByPk(id);
    
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found' });
    }

    // Force recalculation by saving the inventaire
    await inventaire.save();
    
    res.json({ 
      message: 'Equipment count recalculated', 
      totalEquipement: inventaire.totalEquipement 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};