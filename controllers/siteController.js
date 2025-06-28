const { Site, Entreprise } = require('../models');

exports.createSite = async (req, res) => {
  try {
    const required = ['name', 'id_entreprise'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }
    const { name, is_warehouse, is_departments, id_entreprise } = req.body;
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) {
      return res.status(400).json({ message: 'The indicated entreprise does not exist' });
    }
    const site = await Site.create({ name, is_warehouse, is_departments, id_entreprise });
    res.status(201).json({ message: 'Site created', site });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findByPk(id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    const { name, is_warehouse, is_departments, id_entreprise } = req.body;
    if (id_entreprise && id_entreprise !== site.id_entreprise) {
      const entreprise = await Entreprise.findByPk(id_entreprise);
      if (!entreprise) {
        return res.status(400).json({ message: 'The indicated entreprise does not exist' });
      }
    }
    await site.update({ name, is_warehouse, is_departments, id_entreprise });
    res.json({ message: 'Site updated', site });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findByPk(id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    await site.update({ is_deleted: true, deleted_at: new Date() });
    res.json({ message: 'Site soft deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.findAll({ where: { is_deleted: false } });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSiteById = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findOne({ where: { id, is_deleted: false } });
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSiteByName = async (req, res) => {
  try {
    const { name } = req.params;
    const sites = await Site.findAll({ where: { name, is_deleted: false } });
    if (!sites.length) return res.status(404).json({ message: 'No site found with this name' });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSiteByEntrepriseId = async (req, res) => {
  try {
    const { id_entreprise } = req.params;
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    const sites = await Site.findAll({ where: { id_entreprise, is_deleted: false } });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSiteByEntrepriseName = async (req, res) => {
  try {
    const { name } = req.params;
    const entreprise = await Entreprise.findOne({ where: { name } });
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    const sites = await Site.findAll({ where: { id_entreprise: entreprise.id, is_deleted: false } });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countAllSites = async (req, res) => {
  try {
    const count = await Site.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countSitesByEntrepriseId = async (req, res) => {
  try {
    const { id_entreprise } = req.params;
    const entreprise = await Entreprise.findByPk(id_entreprise);
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    const count = await Site.count({ where: { id_entreprise, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.countSitesByEntrepriseName = async (req, res) => {
  try {
    const { name } = req.params;
    const entreprise = await Entreprise.findOne({ where: { name } });
    if (!entreprise) return res.status(404).json({ message: 'Entreprise not found' });
    const count = await Site.count({ where: { id_entreprise: entreprise.id, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedSites = async (req, res) => {
  try {
    const sites = await Site.findAll({ where: { is_deleted: true } });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findByPk(id, { paranoid: false });
    
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    if (!site.is_deleted) {
      return res.status(400).json({ message: 'Site is not deleted' });
    }
    
    await site.update({
      is_deleted: false,
      deleted_at: null
    });
    
    res.json({ message: 'Site undeleted successfully', site });
  } catch (err) {
    console.error('Error in undeleteSite:', err);
    res.status(500).json({ message: err.message });
  }
}; 