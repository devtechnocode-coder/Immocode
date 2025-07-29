const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, equipmentController.getAllEquipment);
router.get('/deleted', authenticateToken, requireAdmin, equipmentController.getDeletedEquipment);
router.get('/count', authenticateToken, requireAdmin, equipmentController.countAllEquipment);
router.get('/identifier/:special_identifier', authenticateToken, requireAdmin, equipmentController.getEquipmentBySpecialIdentifier);
router.get('/state/:state', authenticateToken, requireAdmin, equipmentController.getEquipmentByState);
router.get('/user/:user_name', authenticateToken, requireAdmin, equipmentController.getEquipmentByUser);
router.get('/desk/:desk_id', authenticateToken, requireAdmin, equipmentController.getEquipmentByDesk);
router.get('/section/:section_id', authenticateToken, requireAdmin, equipmentController.getEquipmentBySection);
router.get('/:id', authenticateToken, requireAdmin, equipmentController.getEquipmentById);

router.post('/', authenticateToken, requireAdmin, equipmentController.createEquipment);
router.put('/:id', authenticateToken, requireAdmin, equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, requireAdmin, equipmentController.softDeleteEquipment);

// Undelete equipment
router.patch('/undelete/:id', authenticateToken, requireAdmin, equipmentController.undeleteEquipment);

module.exports = router;