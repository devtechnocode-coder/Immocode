const { User, Entreprise } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const RESET_TOKEN_EXPIRY = 60 * 60; // 1 hour

exports.register = async (req, res) => {
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'No user found with this email' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Incorrect password' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'No user with that email' });
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });
    // Send email (dummy transporter for now)
    const transporter = nodemailer.createTransport({ sendmail: true });
    await transporter.sendMail({
      from: 'no-reply@immocode.com',
      to: user.email,
      subject: 'Password Reset',
      text: `Reset your password: http://localhost:3000/reset-password?token=${resetToken}`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 