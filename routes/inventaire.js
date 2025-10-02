const express = require('express');
const router = express.Router();
const inventaireController = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, inventaireController.getAllInventaires);
router.get('/deleted', authenticateToken, requireAdmin, inventaireController.getDeletedInventaires);
router.get('/count', authenticateToken, requireAdmin, inventaireController.countAllInventaires);
router.get('/count/user/:userId', authenticateToken, requireAdmin, inventaireController.countInventairesByUser);
router.get('/name/:name', authenticateToken, requireAdmin, inventaireController.getInventaireByName);
router.get('/user/:userId', authenticateToken, requireAdmin, inventaireController.getInventaireByUserId);
router.get('/placement/:placementType/:placementId', authenticateToken, requireAdmin, inventaireController.getInventaireByPlacement);
router.get('/:id', authenticateToken, requireAdmin, inventaireController.getInventaireById);

router.post('/', authenticateToken, requireAdmin, inventaireController.createInventaire);
router.put('/:id', authenticateToken, requireAdmin, inventaireController.updateInventaire);
router.delete('/:id', authenticateToken, requireAdmin, inventaireController.softDeleteInventaire);

// Undelete inventaire
router.patch('/undelete/:id', authenticateToken, requireAdmin, inventaireController.undeleteInventaire);

// Recalculate equipment count
router.patch('/recalculate-equipment/:id', authenticateToken, requireAdmin, inventaireController.recalculateEquipmentCount);

module.exports = router;