const { Equipment, User, Desk, Section } = require('../models');

exports.createEquipment = async (req, res) => {
  try {
    const required = ['name', 'special_identifier', 'buying_price', 'date_of_purchase', 'state'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }

    const { name, special_identifier, buying_price, date_of_purchase, current_ammortissement, state, user_name, desk_id, section_id } = req.body;

    // Validate desk_id or section_id (one must be provided but not both)
    if ((!desk_id && !section_id) || (desk_id && section_id)) {
      return res.status(400).json({ message: 'Equipment must be assigned to either a desk or a section, but not both' });
    }

    // Check if user exists (if provided)
    if (user_name) {
      const user = await User.findByPk(user_name);
      if (!user) {
        return res.status(400).json({ message: 'The indicated user does not exist' });
      }
    }

    // Check if desk exists (if provided)
    if (desk_id) {
      const desk = await Desk.findByPk(desk_id);
      if (!desk) {
        return res.status(400).json({ message: 'The indicated desk does not exist' });
      }
    }

    // Check if section exists (if provided)
    if (section_id) {
      const section = await Section.findByPk(section_id);
      if (!section) {
        return res.status(400).json({ message: 'The indicated section does not exist' });
      }
    }

    const equipment = await Equipment.create({
      name,
      special_identifier,
      buying_price,
      date_of_purchase,
      current_ammortissement: current_ammortissement || 0,
      state,
      user_name,
      desk_id,
      section_id
    });

    res.status(201).json({ message: 'Equipment created successfully', equipment });
  } catch (err) {
    console.error('Error in createEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id, { paranoid: false });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const { name, special_identifier, buying_price, date_of_purchase, current_ammortissement, state, user_name, desk_id, section_id } = req.body;

    // Validate desk_id or section_id (if provided)
    if ((desk_id !== undefined && section_id !== undefined) && 
        ((!desk_id && !section_id) || (desk_id && section_id))) {
      return res.status(400).json({ message: 'Equipment must be assigned to either a desk or a section, but not both' });
    }

    // Check if user exists (if provided)
    if (user_name !== undefined) {
      if (user_name) {
        const user = await User.findByPk(user_name);
        if (!user) {
          return res.status(400).json({ message: 'The indicated user does not exist' });
        }
      }
    }

    // Check if desk exists (if provided)
    if (desk_id !== undefined) {
      if (desk_id) {
        const desk = await Desk.findByPk(desk_id);
        if (!desk) {
          return res.status(400).json({ message: 'The indicated desk does not exist' });
        }
      }
    }

    // Check if section exists (if provided)
    if (section_id !== undefined) {
      if (section_id) {
        const section = await Section.findByPk(section_id);
        if (!section) {
          return res.status(400).json({ message: 'The indicated section does not exist' });
        }
      }
    }

    await equipment.update({
      name,
      special_identifier,
      buying_price,
      date_of_purchase,
      current_ammortissement,
      state,
      user_name,
      desk_id,
      section_id
    });

    res.json({ message: 'Equipment updated successfully', equipment });
  } catch (err) {
    console.error('Error in updateEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    if (equipment.is_deleted) {
      return res.status(400).json({ message: 'Equipment is already deleted' });
    }
    await equipment.update({
      is_deleted: true,
      deleted_at: new Date()
    });
    res.json({ message: 'Equipment soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByPk(id, { paranoid: false });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    if (!equipment.is_deleted) {
      return res.status(400).json({ message: 'Equipment is not deleted' });
    }
    await equipment.update({
      is_deleted: false,
      deleted_at: null
    });
    res.json({ message: 'Equipment undeleted successfully', equipment });
  } catch (err) {
    console.error('Error in undeleteEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(equipment);
  } catch (err) {
    console.error('Error in getAllEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentBySpecialIdentifier = async (req, res) => {
  try {
    const { special_identifier } = req.params;
    const equipment = await Equipment.findOne({
      where: { special_identifier, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!equipment) {
      return res.status(404).json({ message: 'No equipment found with this special identifier' });
    }
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentBySpecialIdentifier:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentByState = async (req, res) => {
  try {
    const { state } = req.params;
    const equipment = await Equipment.findAll({
      where: { state, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!equipment.length) {
      return res.status(404).json({ message: 'No equipment found with this state' });
    }
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentByState:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentByUser = async (req, res) => {
  try {
    const { user_name } = req.params;
    const equipment = await Equipment.findAll({
      where: { user_name, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentByUser:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentByDesk = async (req, res) => {
  try {
    const { desk_id } = req.params;
    const equipment = await Equipment.findAll({
      where: { desk_id, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentByDesk:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipmentBySection = async (req, res) => {
  try {
    const { section_id } = req.params;
    const equipment = await Equipment.findAll({
      where: { section_id, is_deleted: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(equipment);
  } catch (err) {
    console.error('Error in getEquipmentBySection:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll({
      where: { is_deleted: true },
      paranoid: false,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Desk,
          as: 'desk',
          attributes: ['id', 'name']
        },
        {
          model: Section,
          as: 'section',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(equipment);
  } catch (err) {
    console.error('Error in getDeletedEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllEquipment = async (req, res) => {
  try {
    const count = await Equipment.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllEquipment:', err);
    res.status(500).json({ message: err.message });
  }
};