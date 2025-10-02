const { Department, User, Site } = require('../models');

exports.createDepartment = async (req, res) => {
  try {
    const required = ['name', 'id_site'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, number_of_desks, responsable_name, id_site } = req.body;
    // Check if site exists
    const site = await Site.findByPk(id_site);
    if (!site) {
      return res.status(400).json({ message: 'The indicated site does not exist' });
    }
    // Check if responsable user exists (if provided)
    if (responsable_name) {
      const user = await User.findByPk(responsable_name);
      if (!user) {
        return res.status(400).json({ message: 'The indicated responsable user does not exist' });
      }
    }
    const department = await Department.create({
      name,
      number_of_desks: number_of_desks || 0,
      responsable_name,
      id_site
    });
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (err) {
    console.error('Error in createDepartment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, { paranoid: false });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const { name, number_of_desks, responsable_name, id_site } = req.body;
    // Check if site exists (if provided)
    if (id_site) {
      const site = await Site.findByPk(id_site);
      if (!site) {
        return res.status(400).json({ message: 'The indicated site does not exist' });
      }
    }
    // Check if responsable user exists (if provided)
    if (responsable_name) {
      const user = await User.findByPk(responsable_name);
      if (!user) {
        return res.status(400).json({ message: 'The indicated responsable user does not exist' });
      }
    }
    await department.update({
      name,
      number_of_desks,
      responsable_name,
      id_site
    });
    res.json({ message: 'Department updated successfully', department });
  } catch (err) {
    console.error('Error in updateDepartment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    if (department.is_deleted) {
      return res.status(400).json({ message: 'Department is already deleted' });
    }
    await department.update({
      is_deleted: true,
      deleted_at: new Date()
    });
    res.json({ message: 'Department soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteDepartment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id, { paranoid: false });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    if (!department.is_deleted) {
      return res.status(400).json({ message: 'Department is not deleted' });
    }
    await department.update({
      is_deleted: false,
      deleted_at: null
    });
    res.json({ message: 'Department undeleted successfully', department });
  } catch (err) {
    console.error('Error in undeleteDepartment:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(departments);
  } catch (err) {
    console.error('Error in getAllDepartments:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name']
        }
      ]
    });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (err) {
    console.error('Error in getDepartmentById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartmentByName = async (req, res) => {
  try {
    const { name } = req.params;
    const departments = await Department.findAll({
      where: { name, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name']
        }
      ]
    });
    if (!departments.length) {
      return res.status(404).json({ message: 'No department found with this name' });
    }
    res.json(departments);
  } catch (err) {
    console.error('Error in getDepartmentByName:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartmentsBySite = async (req, res) => {
  try {
    const { id_site } = req.params;
    const departments = await Department.findAll({
      where: { id_site, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { id: id_site, is_deleted: false },
          required: false,
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(departments);
  } catch (err) {
    console.error('Error in getDepartmentsBySite:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { is_deleted: true },
      paranoid: false,
      include: [
        {
          model: User,
          as: 'responsable',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { is_deleted: false },
          required: false,
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(departments);
  } catch (err) {
    console.error('Error in getDeletedDepartments:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllDepartments = async (req, res) => {
  try {
    const count = await Department.count({ 
      where: { is_deleted: false },
      include: [
        {
          model: Site,
          as: 'site',
          where: { is_deleted: false }, // ✅ Only count departments with non-deleted sites
          required: true // ✅ Only count if site exists and is not deleted
        }
      ]
    });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllDepartments:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countDepartmentsBySite = async (req, res) => {
  try {
    const { id_site } = req.params;
    const count = await Department.count({ 
      where: { 
        id_site, 
        is_deleted: false 
      },
      include: [
        {
          model: Site,
          as: 'site',
          where: { 
            id: id_site, 
            is_deleted: false // ✅ Only count if site exists and is not deleted
          },
          required: true
        }
      ]
    });
    res.json({ count });
  } catch (err) {
    console.error('Error in countDepartmentsBySite:', err);
    res.status(500).json({ message: err.message });
  }
};