const { Inventaire, User, Desk, Section, Equipment } = require('../models');
const { Op } = require('sequelize');

// Get all inventories for current user
exports.getMyInventaires = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventaires = await Inventaire.findAll({
      where: { AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        {
          model: Equipment,
          as: 'equipment',
          required: false,
          where: { is_deleted: false },
          include: [
            { model: Desk, as: 'desk', attributes: ['id', 'name'] },
            { model: Section, as: 'section', attributes: ['id', 'name'] }
          ]
        },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    const results = inventaires.map(inv => {
      const equipmentList = inv.equipment || [];
      const emplacement = inv.PlacementType === 'desk' ? inv.desk?.name : inv.section?.name;

      return {
        idInventaire: inv.idInventaire,
        name: inv.inventoryType,
        status: inv.status,
        startDate: inv.startDate,
        priority: inv.priority,
        PlacementType: inv.PlacementType,
        emplacement,
        equipmentCount: equipmentList.length,
        equipmentList: equipmentList.map(eq => ({
          id: eq.id,
          name: eq.name,
          special_identifier: eq.special_identifier,
          buying_price: eq.buying_price,
          date_of_purchase: eq.date_of_purchase,
          current_ammortissement: eq.current_ammortissement,
          state: eq.state,
          desk: eq.desk?.name || null,
          section: eq.section?.name || null
        })),
        associatedUser: inv.associatedUser
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get single inventory by ID
exports.getMyInventaireById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const inventaire = await Inventaire.findOne({
      where: { idInventaire: id, AssociatedTo: userId, isDeleted: false },
      include: [
        { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
        {
          model: Equipment,
          as: 'equipment',
          required: false,
          where: { is_deleted: false },
          include: [
            { model: Desk, as: 'desk', attributes: ['id', 'name'] },
            { model: Section, as: 'section', attributes: ['id', 'name'] }
          ]
        },
        { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
        { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
      ]
    });

    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire not found or you do not have access' });
    }

    const equipmentList = inventaire.equipment || [];
    const emplacement = inventaire.PlacementType === 'desk' ? inventaire.desk?.name : inventaire.section?.name;

    res.json({
      idInventaire: inventaire.idInventaire,
      name: inventaire.inventoryType,
      status: inventaire.status,
      startDate: inventaire.startDate,
      priority: inventaire.priority,
      PlacementType: inventaire.PlacementType,
      emplacement,
      equipmentCount: equipmentList.length,
      equipmentList: equipmentList.map(eq => ({
        id: eq.id,
        name: eq.name,
        special_identifier: eq.special_identifier,
        buying_price: eq.buying_price,
        date_of_purchase: eq.date_of_purchase,
        current_ammortissement: eq.current_ammortissement,
        state: eq.state,
        desk: eq.desk?.name || null,
        section: eq.section?.name || null
      })),
      associatedUser: inventaire.associatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Create new inventory
exports.createMyInventaire = async (req, res) => {
  try {
    const required = ['startDate', 'PlacementType', 'idPlacement', 'inventoryType'];
    const missing = required.filter(attr => !req.body[attr]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing attribute(s): ${missing.join(', ')}` });
    }

    const userId = req.user.id;
    const { startDate, PlacementType, idPlacement, priority, inventoryType } = req.body;

    // Validate placement exists
    if (PlacementType === 'desk') {
      const desk = await Desk.findByPk(idPlacement);
      if (!desk) return res.status(400).json({ message: 'Desk does not exist' });
    } else if (PlacementType === 'section') {
      const section = await Section.findByPk(idPlacement);
      if (!section) return res.status(400).json({ message: 'Section does not exist' });
    } else {
      return res.status(400).json({ message: 'Invalid placement type' });
    }

    const inventaire = await Inventaire.create({
      startDate,
      AssociatedTo: userId,
      PlacementType,
      idPlacement,
      priority: priority || 'medium',
      inventoryType
    });

    // Fetch the full inventory with equipment count and emplacement
    const fullInventaire = await exports.getMyInventaireByIdInternal(inventaire.idInventaire, userId);

    res.status(201).json(fullInventaire);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update inventory
exports.updateMyInventaire = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const inventaire = await Inventaire.findOne({ where: { idInventaire: id, AssociatedTo: userId, isDeleted: false } });
    if (!inventaire) return res.status(404).json({ message: 'Inventaire not found or access denied' });

    const { startDate, PlacementType, idPlacement, priority, inventoryType, status } = req.body;

    // Validate placement if changed
    if ((PlacementType && PlacementType !== inventaire.PlacementType) || (idPlacement && idPlacement !== inventaire.idPlacement)) {
      const finalPlacementType = PlacementType || inventaire.PlacementType;
      const finalIdPlacement = idPlacement || inventaire.idPlacement;

      if (finalPlacementType === 'desk') {
        const desk = await Desk.findByPk(finalIdPlacement);
        if (!desk) return res.status(400).json({ message: 'Desk does not exist' });
      } else if (finalPlacementType === 'section') {
        const section = await Section.findByPk(finalIdPlacement);
        if (!section) return res.status(400).json({ message: 'Section does not exist' });
      }
    }

    await inventaire.update({ startDate, PlacementType, idPlacement, priority, inventoryType, status });

    // Fetch the full inventory with equipment count and emplacement
    const fullInventaire = await exports.getMyInventaireByIdInternal(inventaire.idInventaire, userId);

    res.json(fullInventaire);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Internal helper to fetch inventory by ID with equipment and emplacement
exports.getMyInventaireByIdInternal = async (idInventaire, userId) => {
  const inventaire = await Inventaire.findOne({
    where: { idInventaire, AssociatedTo: userId, isDeleted: false },
    include: [
      { model: User, as: 'associatedUser', attributes: ['id', 'name', 'email'] },
      {
        model: Equipment,
        as: 'equipment',
        required: false,
        where: { is_deleted: false },
        include: [
          { model: Desk, as: 'desk', attributes: ['id', 'name'] },
          { model: Section, as: 'section', attributes: ['id', 'name'] }
        ]
      },
      { model: Desk, as: 'desk', attributes: ['id', 'name'], required: false },
      { model: Section, as: 'section', attributes: ['id', 'name'], required: false }
    ]
  });

  if (!inventaire) return null;

  const equipmentList = inventaire.equipment || [];
  const emplacement = inventaire.PlacementType === 'desk' ? inventaire.desk?.name : inventaire.section?.name;

  return {
    idInventaire: inventaire.idInventaire,
    name: inventaire.inventoryType,
    status: inventaire.status,
    startDate: inventaire.startDate,
    priority: inventaire.priority,
    PlacementType: inventaire.PlacementType,
    emplacement,
    equipmentCount: equipmentList.length,
    equipmentList: equipmentList.map(eq => ({
      id: eq.id,
      name: eq.name,
      special_identifier: eq.special_identifier,
      buying_price: eq.buying_price,
      date_of_purchase: eq.date_of_purchase,
      current_ammortissement: eq.current_ammortissement,
      state: eq.state,
      desk: eq.desk?.name || null,
      section: eq.section?.name || null
    })),
    associatedUser: inventaire.associatedUser
  };
};
