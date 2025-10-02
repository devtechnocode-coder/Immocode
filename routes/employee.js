const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, employeeController.getAllEmployees);
router.get('/deleted', authenticateToken, requireAdmin, employeeController.getDeletedEmployees);
router.get('/count', authenticateToken, requireAdmin, employeeController.countAllEmployees);
router.get('/count/entreprise/:id_entreprise', authenticateToken, requireAdmin, employeeController.countEmployeesByEntreprise);
router.get('/entreprise/:id_entreprise', authenticateToken, requireAdmin, employeeController.getEmployeesByEntreprise);
router.get('/:id', authenticateToken, requireAdmin, employeeController.getEmployeeById);

router.post('/', authenticateToken, requireAdmin, employeeController.createEmployee);
router.put('/:id', authenticateToken, requireAdmin, employeeController.updateEmployee);
router.delete('/:id', authenticateToken, requireAdmin, employeeController.softDeleteEmployee);

// Undelete employee
router.patch('/undelete/:id', authenticateToken, requireAdmin, employeeController.undeleteEmployee);

module.exports = router;