const { User } = require('../models');
const bcrypt = require('bcrypt');
const { Entreprise } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      where: { is_deleted: false, is_active: true },
      attributes: { exclude: ['password'] } 
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ 
      where: { id, is_deleted: false }, 
      attributes: { exclude: ['password'] } 
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    const users = await User.findAll({ 
      where: { name, is_deleted: false, is_active: true }, 
      attributes: { exclude: ['password'] } 
    });
    if (!users.length) return res.status(404).json({ message: 'No user found with this name' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ 
      where: { email, is_deleted: false }, 
      attributes: { exclude: ['password'] } 
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, surname, email, role, id_entreprise } = req.body;
    await user.update({ name, surname, email, role, id_entreprise });
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User updated', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const now = new Date();
    await user.update({ 
      is_deleted: true, 
      deleted_at: now,
      updated_at: now
    });
    res.json({ message: 'User soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ is_active: true });
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User activated', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ is_active: false });
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User deactivated', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      where: { is_deleted: true },
      attributes: { exclude: ['password'] },
      paranoid: false
    });
    
    console.log('Sequelize query results:', users.length);
    console.log('User IDs:', users.map(u => u.id));
    
    res.json(users);
  } catch (err) {
    console.error('Error in getDeletedUsers:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const count = await User.count({ where: { is_deleted: false, is_active: true } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const count = await User.count({ where: { role, is_deleted: false, is_active: true } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { paranoid: false });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.is_deleted) {
      return res.status(400).json({ message: 'User is not deleted' });
    }
    
    await user.update({
      is_deleted: false,
      deleted_at: null
    });
    
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User undeleted successfully', user: userWithoutPassword });
  } catch (err) {
    console.error('Error in undeleteUser:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.is_deleted) {
      return res.status(400).json({ message: 'User is already deleted' });
    }
    
    await user.update({
      is_deleted: true,
      deleted_at: new Date()
    });
    
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User soft deleted successfully', user: userWithoutPassword });
  } catch (err) {
    console.error('Error in softDeleteUserByEmail:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email }, paranoid: false });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.is_deleted) {
      return res.status(400).json({ message: 'User is not deleted' });
    }
    
    await user.update({
      is_deleted: false,
      deleted_at: null
    });
    
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json({ message: 'User undeleted successfully', user: userWithoutPassword });
  } catch (err) {
    console.error('Error in undeleteUserByEmail:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const required = ['name', 'surname', 'email', 'password', 'role', 'id_entreprise'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, surname, email, password, role, id_entreprise } = req.body;
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) {
      return res.status(400).json({ message: 'The indicated entreprise does not exist' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, surname, email, password: hashedPassword, role, id_entreprise });
    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const required = ['name', 'surname', 'email', 'password', 'role', 'id_entreprise'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    
    const { name, surname, email, password, role, id_entreprise } = req.body;
    
    // Check if entreprise exists
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) {
      return res.status(400).json({ message: 'The indicated entreprise does not exist' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      surname, 
      email, 
      password: hashedPassword, 
      role, 
      id_entreprise 
    });
    
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ message: err.message });
  }
}; 