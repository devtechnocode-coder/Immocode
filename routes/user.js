const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', userController.registerUser);

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.get('/deleted', authenticateToken, requireAdmin, userController.getDeletedUsers);
router.get('/count', authenticateToken, requireAdmin, userController.countUsers);
router.get('/count/role/:role', authenticateToken, requireAdmin, userController.countUsersByRole);
router.get('/name/:name', authenticateToken, requireAdmin, userController.getUserByName);
router.get('/email/:email', authenticateToken, requireAdmin, userController.getUserByEmail);
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);
router.put('/:id/activate', authenticateToken, requireAdmin, userController.activateUser);
router.put('/:id/deactivate', authenticateToken, requireAdmin, userController.deactivateUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.softDeleteUser);

// Undelete user by ID
router.patch('/undelete/:id', authenticateToken, requireAdmin, userController.undeleteUser);

// Soft delete user by email
router.delete('/delete-by-email/:email', authenticateToken, requireAdmin, userController.softDeleteUserByEmail);

// Undelete user by email
router.patch('/undelete-by-email/:email', authenticateToken, requireAdmin, userController.undeleteUserByEmail);

module.exports = router; 