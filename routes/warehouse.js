const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, warehouseController.getAllWarehouses);
router.get('/deleted', authenticateToken, requireAdmin, warehouseController.getDeletedWarehouses);
router.get('/count', authenticateToken, requireAdmin, warehouseController.countAllWarehouses);
router.get('/count/site/:id_site', authenticateToken, requireAdmin, warehouseController.countWarehousesBySite);
router.get('/count/site-name/:name', authenticateToken, requireAdmin, warehouseController.countWarehousesBySiteName);
router.get('/name/:name', authenticateToken, requireAdmin, warehouseController.getWarehouseByName);
router.get('/site/:id_site', authenticateToken, requireAdmin, warehouseController.getWarehousesBySite);
router.get('/site-name/:name', authenticateToken, requireAdmin, warehouseController.getWarehousesBySiteName);
router.get('/:id', authenticateToken, requireAdmin, warehouseController.getWarehouseById);

router.post('/', authenticateToken, requireAdmin, warehouseController.createWarehouse);
router.put('/:id', authenticateToken, requireAdmin, warehouseController.updateWarehouse);
router.delete('/:id', authenticateToken, requireAdmin, warehouseController.softDeleteWarehouse);

// Undelete warehouse
router.patch('/undelete/:id', authenticateToken, requireAdmin, warehouseController.undeleteWarehouse);

module.exports = router; 