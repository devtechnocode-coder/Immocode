const { Desk, Department } = require('../models');

exports.createDesk = async (req, res) => {
  try {
    const required = ['name', 'id_department'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, id_department } = req.body;
    // Check if department exists
    const department = await Department.findByPk(id_department);
    if (!department) {
      return res.status(400).json({ message: 'The indicated department does not exist' });
    }
    const desk = await Desk.create({ name, id_department });
    res.status(201).json({ message: 'Desk created successfully', desk });
  } catch (err) {
    console.error('Error in createDesk:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDesk = async (req, res) => {
  try {
    const { id } = req.params;
    const desk = await Desk.findByPk(id, { paranoid: false });
    if (!desk) {
      return res.status(404).json({ message: 'Desk not found' });
    }
    const { name, id_department } = req.body;
    // Check if department exists (if provided)
    if (id_department) {
      const department = await Department.findByPk(id_department);
      if (!department) {
        return res.status(400).json({ message: 'The indicated department does not exist' });
      }
    }
    await desk.update({ name, id_department });
    res.json({ message: 'Desk updated successfully', desk });
  } catch (err) {
    console.error('Error in updateDesk:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteDesk = async (req, res) => {
  try {
    const { id } = req.params;
    const desk = await Desk.findByPk(id);
    if (!desk) {
      return res.status(404).json({ message: 'Desk not found' });
    }
    if (desk.is_deleted) {
      return res.status(400).json({ message: 'Desk is already deleted' });
    }
    await desk.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'Desk soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteDesk:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteDesk = async (req, res) => {
  try {
    const { id } = req.params;
    const desk = await Desk.findByPk(id, { paranoid: false });
    if (!desk) {
      return res.status(404).json({ message: 'Desk not found' });
    }
    if (!desk.is_deleted) {
      return res.status(400).json({ message: 'Desk is not deleted' });
    }
    await desk.update({ is_deleted: false, deleted_at: null });
    res.json({ message: 'Desk undeleted successfully', desk });
  } catch (err) {
    console.error('Error in undeleteDesk:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDesks = async (req, res) => {
  try {
    const desks = await Desk.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(desks);
  } catch (err) {
    console.error('Error in getAllDesks:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeskById = async (req, res) => {
  try {
    const { id } = req.params;
    const desk = await Desk.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!desk) {
      return res.status(404).json({ message: 'Desk not found' });
    }
    res.json(desk);
  } catch (err) {
    console.error('Error in getDeskById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDesksByDepartment = async (req, res) => {
  try {
    const { id_department } = req.params;
    const desks = await Desk.findAll({
      where: { id_department, is_deleted: false },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(desks);
  } catch (err) {
    console.error('Error in getDesksByDepartment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedDesks = async (req, res) => {
  try {
    const desks = await Desk.findAll({
      where: { is_deleted: true },
      paranoid: false,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(desks);
  } catch (err) {
    console.error('Error in getDeletedDesks:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllDesks = async (req, res) => {
  try {
    const count = await Desk.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllDesks:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countDesksByDepartment = async (req, res) => {
  try {
    const { id_department } = req.params;
    const count = await Desk.count({ where: { id_department, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countDesksByDepartment:', err);
    res.status(500).json({ message: err.message });
  }
}; 