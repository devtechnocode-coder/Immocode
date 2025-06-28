const { Warehouse, User, Site, Entreprise } = require('../models');

exports.createWarehouse = async (req, res) => {
  try {
    const required = ['name', 'id_site'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }

    const { name, number_of_sections, responsable_name, id_site } = req.body;

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

    const warehouse = await Warehouse.create({
      name,
      number_of_sections: number_of_sections || 0,
      responsable_name,
      id_site
    });

    res.status(201).json({ message: 'Warehouse created successfully', warehouse });
  } catch (err) {
    console.error('Error in createWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findByPk(id, { paranoid: false });
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    const { name, number_of_sections, responsable_name, id_site } = req.body;

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

    await warehouse.update({
      name,
      number_of_sections,
      responsable_name,
      id_site
    });

    res.json({ message: 'Warehouse updated successfully', warehouse });
  } catch (err) {
    console.error('Error in updateWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.softDeleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findByPk(id);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    if (warehouse.is_deleted) {
      return res.status(400).json({ message: 'Warehouse is already deleted' });
    }

    await warehouse.update({
      is_deleted: true,
      deleted_at: new Date()
    });

    res.json({ message: 'Warehouse soft deleted successfully' });
  } catch (err) {
    console.error('Error in softDeleteWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    res.json(warehouses);
  } catch (err) {
    console.error('Error in getAllWarehouses:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findOne({
      where: { id, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    res.json(warehouse);
  } catch (err) {
    console.error('Error in getWarehouseById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getWarehouseByName = async (req, res) => {
  try {
    const { name } = req.params;
    const warehouses = await Warehouse.findAll({
      where: { name, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!warehouses.length) {
      return res.status(404).json({ message: 'No warehouse found with this name' });
    }

    res.json(warehouses);
  } catch (err) {
    console.error('Error in getWarehouseByName:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getWarehousesBySite = async (req, res) => {
  try {
    const { id_site } = req.params;
    const warehouses = await Warehouse.findAll({
      where: { id_site, is_deleted: false },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    res.json(warehouses);
  } catch (err) {
    console.error('Error in getWarehousesBySite:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getWarehousesBySiteName = async (req, res) => {
  try {
    const { name } = req.params;
    const warehouses = await Warehouse.findAll({
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          where: { name },
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      where: { is_deleted: false }
    });

    res.json(warehouses);
  } catch (err) {
    console.error('Error in getWarehousesBySiteName:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countAllWarehouses = async (req, res) => {
  try {
    const count = await Warehouse.count({ where: { is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countAllWarehouses:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countWarehousesBySite = async (req, res) => {
  try {
    const { id_site } = req.params;
    const count = await Warehouse.count({ where: { id_site, is_deleted: false } });
    res.json({ count });
  } catch (err) {
    console.error('Error in countWarehousesBySite:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.countWarehousesBySiteName = async (req, res) => {
  try {
    const { name } = req.params;
    const count = await Warehouse.count({
      include: [
        {
          model: Site,
          as: 'site',
          where: { name },
          attributes: []
        }
      ],
      where: { is_deleted: false }
    });
    res.json({ count });
  } catch (err) {
    console.error('Error in countWarehousesBySiteName:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDeletedWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { is_deleted: true },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'surname', 'email']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name'],
          include: [
            {
              model: Entreprise,
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      paranoid: false
    });

    res.json(warehouses);
  } catch (err) {
    console.error('Error in getDeletedWarehouses:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.undeleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await Warehouse.findByPk(id, { paranoid: false });
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    
    if (!warehouse.is_deleted) {
      return res.status(400).json({ message: 'Warehouse is not deleted' });
    }
    
    await warehouse.update({
      is_deleted: false,
      deleted_at: null
    });
    
    res.json({ message: 'Warehouse undeleted successfully', warehouse });
  } catch (err) {
    console.error('Error in undeleteWarehouse:', err);
    res.status(500).json({ message: err.message });
  }
}; 