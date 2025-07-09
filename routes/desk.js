const express = require('express');
const router = express.Router();
const deskController = require('../controllers/deskController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, deskController.getAllDesks);
router.get('/deleted', authenticateToken, requireAdmin, deskController.getDeletedDesks);
router.get('/count', authenticateToken, requireAdmin, deskController.countAllDesks);
router.get('/count/department/:id_department', authenticateToken, requireAdmin, deskController.countDesksByDepartment);
router.get('/department/:id_department', authenticateToken, requireAdmin, deskController.getDesksByDepartment);
router.get('/:id', authenticateToken, requireAdmin, deskController.getDeskById);

router.post('/', authenticateToken, requireAdmin, deskController.createDesk);
router.put('/:id', authenticateToken, requireAdmin, deskController.updateDesk);
router.delete('/:id', authenticateToken, requireAdmin, deskController.softDeleteDesk);

// Undelete desk
router.patch('/undelete/:id', authenticateToken, requireAdmin, deskController.undeleteDesk);

module.exports = router; 