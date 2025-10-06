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

module.exports = router;
