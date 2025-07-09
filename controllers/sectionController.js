const { Section, Warehouse } = require('../models');

exports.createSection = async (req, res) => {
  try {
    const required = ['name', 'id_warehouse'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, id_warehouse } = req.body;
    // Check if warehouse exists
    const warehouse = await Warehouse.findByPk(id_warehouse);
    if (!warehouse) {
      return res.status(400).json({ message: 'The indicated warehouse does not exist' });
    }
    const section = await Section.create({ name, id_warehouse });
    res.status(201).json({ message: 'Section created successfully', section });
  } catch (err) {
    console.error('Error in createSection:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByPk(id, { paranoid: false });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    const { name, id_warehouse } = req.body;
    // Check if warehouse exists (if provided)
    if (id_warehouse) {
      const warehouse = await Warehouse.findByPk(id_warehouse);
      if (!warehouse) {
        return res.status(400).json({ message: 'The indicated warehouse does not exist' });
      }
    }
    await section.update({ name, id_warehouse });
    res.json({ message: 'Section updated successfully', section });
  } catch (err) {
    console.error('Error in updateSection:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    if (section.is_deleted) {
      return res.status(400).json({ message: 'Section is already deleted' });
    }
    await section.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'Section soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteSection:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByPk(id, { paranoid: false });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    if (!section.is_deleted) {
      return res.status(400).json({ message: 'Section is not deleted' });
    }
    await section.update({ is_deleted: false, deleted_at: null });
    res.json({ message: 'Section undeleted successfully', section });
  } catch (err) {
    console.error('Error in undeleteSection:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(sections);
  } catch (err) {
    console.error('Error in getAllSections:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (err) {
    console.error('Error in getSectionById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSectionsByWarehouse = async (req, res) => {
  try {
    const { id_warehouse } = req.params;
    const sections = await Section.findAll({
      where: { id_warehouse, is_deleted: false },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(sections);
  } catch (err) {
    console.error('Error in getSectionsByWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedSections = async (req, res) => {
  try {
    const sections = await Section.findAll({
      where: { is_deleted: true },
      paranoid: false,
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(sections);
  } catch (err) {
    console.error('Error in getDeletedSections:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllSections = async (req, res) => {
  try {
    const count = await Section.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllSections:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countSectionsByWarehouse = async (req, res) => {
  try {
    const { id_warehouse } = req.params;
    const count = await Section.count({ where: { id_warehouse, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countSectionsByWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
}; 