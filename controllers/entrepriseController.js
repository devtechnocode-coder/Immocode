const { Entreprise, User } = require('../models');

exports.createEntreprise = async (req, res) => {
  try {
    const required = ['name', 'matricule_fiscale', 'email', 'tel'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, matricule_fiscale, email, tel } = req.body;
    const existingEmail = await Entreprise.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'An entreprise with this email already exists' });
    const existingMatricule = await Entreprise.findOne({ where: { matricule_fiscale } });
    if (existingMatricule) return res.status(400).json({ message: 'An entreprise with this matricule_fiscale already exists' });
    const entreprise = await Entreprise.create({ name, matricule_fiscale, email, tel });
    res.status(201).json({ message: 'Entreprise created', entreprise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const entreprise = await Entreprise.findByPk(id);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    const { name, matricule_fiscale, email, tel } = req.body;
    if (email && email !== entreprise.email) {
      const existingEmail = await Entreprise.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ message: 'An entreprise with this email already exists' });
    }
    if (matricule_fiscale && matricule_fiscale !== entreprise.matricule_fiscale) {
      const existingMatricule = await Entreprise.findOne({ where: { matricule_fiscale } });
      if (existingMatricule) return res.status(400).json({ message: 'An entreprise with this matricule_fiscale already exists' });
    }
    await entreprise.update({ name, matricule_fiscale, email, tel });
    res.json({ message: 'Entreprise updated', entreprise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const entreprise = await Entreprise.findByPk(id);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    await entreprise.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'Entreprise soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.findAll({ where: { is_deleted: false } });
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntrepriseByName = async (req, res) => {
  try {
    const { name } = req.params;
    const entreprises = await Entreprise.findAll({ where: { name, is_deleted: false } });
    if (!entreprises.length) return res.status(404).json({ message: 'No entreprise found with this name' });
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEntrepriseById = async (req, res) => {
  try {
    const { id } = req.params;
    const entreprise = await Entreprise.findOne({ where: { id, is_deleted: false } });
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    res.json(entreprise);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countEntreprises = async (req, res) => {
  try {
    const count = await Entreprise.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.findAll({ where: { is_deleted: true } });
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteEntreprise = async (req, res) => {
  try {
    const { id } = req.params;
    const entreprise = await Entreprise.findByPk(id, { paranoid: false });
    
    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise not found' });
    }
    
    if (!entreprise.is_deleted) {
      return res.status(400).json({ message: 'Entreprise is not deleted' });
    }
    
    await entreprise.update({
      is_deleted: false,
      deleted_at: null
    });
    
    res.json({ message: 'Entreprise undeleted successfully', entreprise });
  } catch (err) {
    console.error('Error in undeleteEntreprise:', err);
    res.status(500).json({ message: err.message });
  }
}; 