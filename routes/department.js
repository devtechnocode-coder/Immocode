const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, departmentController.getAllDepartments);
router.get('/deleted', authenticateToken, requireAdmin, departmentController.getDeletedDepartments);
router.get('/count', authenticateToken, requireAdmin, departmentController.countAllDepartments);
router.get('/count/site/:id_site', authenticateToken, requireAdmin, departmentController.countDepartmentsBySite);
router.get('/name/:name', authenticateToken, requireAdmin, departmentController.getDepartmentByName);
router.get('/site/:id_site', authenticateToken, requireAdmin, departmentController.getDepartmentsBySite);
router.get('/:id', authenticateToken, requireAdmin, departmentController.getDepartmentById);

router.post('/', authenticateToken, requireAdmin, departmentController.createDepartment);
router.put('/:id', authenticateToken, requireAdmin, departmentController.updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, departmentController.softDeleteDepartment);

// Undelete department
router.patch('/undelete/:id', authenticateToken, requireAdmin, departmentController.undeleteDepartment);

module.exports = router; 