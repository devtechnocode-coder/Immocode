const express = require('express');
const router = express.Router();
const inventaireMobileController = require('../controllers/inventaireMobileController');
const { authenticateToken } = require('../middleware/auth');

// Mobile routes
router.get('/', authenticateToken, inventaireMobileController.getMyInventaires);
router.get('/stats', authenticateToken, inventaireMobileController.getMyInventaireStats);
router.get('/:id', authenticateToken, inventaireMobileController.getMyInventaireById);
router.post('/', authenticateToken, inventaireMobileController.createMyInventaire);
router.put('/:id', authenticateToken, inventaireMobileController.updateMyInventaire);

// Add the new status update route
router.put('/:id/status', authenticateToken, inventaireMobileController.updateMyInventaireStatus);
router.get('/:id/equipment', authenticateToken, inventaireMobileController.getInventoryEquipment);
module.exports = router; // Fixed the typo here - was "module.exp orts"