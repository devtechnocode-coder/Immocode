const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, entrepriseController.getAllEntreprises);
router.get('/deleted', authenticateToken, requireAdmin, entrepriseController.getDeletedEntreprises);
router.get('/count', authenticateToken, requireAdmin, entrepriseController.countEntreprises);
router.get('/name/:name', authenticateToken, requireAdmin, entrepriseController.getEntrepriseByName);
router.get('/:id', authenticateToken, requireAdmin, entrepriseController.getEntrepriseById);

router.post('/', authenticateToken, requireAdmin, entrepriseController.createEntreprise);
router.put('/:id', authenticateToken, requireAdmin, entrepriseController.updateEntreprise);
router.delete('/:id', authenticateToken, requireAdmin, entrepriseController.softDeleteEntreprise);

// Undelete entreprise
router.patch('/undelete/:id', authenticateToken, requireAdmin, entrepriseController.undeleteEntreprise);

module.exports = router; 