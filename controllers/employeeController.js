const { Employee, Entreprise } = require('../models');

exports.createEmployee = async (req, res) => {
  try {
    const required = ['firstName', 'lastName', 'id_entreprise'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { firstName, lastName, CIN, id_entreprise } = req.body;
    
    // Check if entreprise exists
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) {
      return res.status(400).json({ message: 'The indicated entreprise does not exist' });
    }
    
    // Check if CIN is unique (if provided)
    if (CIN) {
      const existingEmployee = await Employee.findOne({ where: { CIN } });
      if (existingEmployee) {
        return res.status(400).json({ message: 'CIN must be unique' });
      }
    }
    
    const employee = await Employee.create({ firstName, lastName, CIN, id_entreprise });
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (err) {
    console.error('Error in createEmployee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, { paranoid: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    const { firstName, lastName, CIN, id_entreprise } = req.body;
    
    // Check if entreprise exists (if provided)
    if (id_entreprise) {
      const entreprise = await Entreprise.findByPk(id_entreprise);
      if (!entreprise) {
        return res.status(400).json({ message: 'The indicated entreprise does not exist' });
      }
    }
    
    // Check if CIN is unique (if provided and changed)
    if (CIN && CIN !== employee.CIN) {
      const existingEmployee = await Employee.findOne({ where: { CIN } });
      if (existingEmployee) {
        return res.status(400).json({ message: 'CIN must be unique' });
      }
    }
    
    await employee.update({ firstName, lastName, CIN, id_entreprise });
    res.json({ message: 'Employee updated successfully', employee });
  } catch (err) {
    console.error('Error in updateEmployee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (employee.is_deleted) {
      return res.status(400).json({ message: 'Employee is already deleted' });
    }
    await employee.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'Employee soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteEmployee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, { paranoid: false });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (!employee.is_deleted) {
      return res.status(400).json({ message: 'Employee is not deleted' });
    }
    await employee.update({ is_deleted: false, deleted_at: null });
    res.json({ message: 'Employee undeleted successfully', employee });
  } catch (err) {
    console.error('Error in undeleteEmployee:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: Entreprise,
          as: 'entreprise',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(employees);
  } catch (err) {
    console.error('Error in getAllEmployees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({
      where: { idEmployee: id, is_deleted: false },
      include: [
        {
          model: Entreprise,
          as: 'entreprise',
          attributes: ['id', 'name']
        }
      ]
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Error in getEmployeeById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeesByEntreprise = async (req, res) => {
  try {
    const { id_entreprise } = req.params;
    const employees = await Employee.findAll({
      where: { id_entreprise, is_deleted: false },
      include: [
        {
          model: Entreprise,
          as: 'entreprise',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(employees);
  } catch (err) {
    console.error('Error in getEmployeesByEntreprise:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { is_deleted: true },
      paranoid: false,
      include: [
        {
          model: Entreprise,
          as: 'entreprise',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(employees);
  } catch (err) {
    console.error('Error in getDeletedEmployees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllEmployees = async (req, res) => {
  try {
    const count = await Employee.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllEmployees:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countEmployeesByEntreprise = async (req, res) => {
  try {
    const { id_entreprise } = req.params;
    const count = await Employee.count({ where: { id_entreprise, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countEmployeesByEntreprise:', err);
    res.status(500).json({ message: err.message });
  }
};