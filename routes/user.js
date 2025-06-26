const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/count', userController.countUsers);
router.get('/count/role/:role', userController.countUsersByRole);
router.get('/name/:name', userController.getUserByName);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.softDeleteUser);

module.exports = router; 