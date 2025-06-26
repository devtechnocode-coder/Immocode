const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    const users = await User.findAll({ where: { name }, attributes: { exclude: ['password'] } });
    if (!users.length) return res.status(404).json({ message: 'No user found with this name' });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email }, attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, surname, email, role, id_entreprise } = req.body;
    await user.update({ name, surname, email, role, id_entreprise });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'User soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countUsers = async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const count = await User.count({ where: { role } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 