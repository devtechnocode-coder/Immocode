const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, sectionController.getAllSections);
router.get('/deleted', authenticateToken, requireAdmin, sectionController.getDeletedSections);
router.get('/count', authenticateToken, requireAdmin, sectionController.countAllSections);
router.get('/count/warehouse/:id_warehouse', authenticateToken, requireAdmin, sectionController.countSectionsByWarehouse);
router.get('/warehouse/:id_warehouse', authenticateToken, requireAdmin, sectionController.getSectionsByWarehouse);
router.get('/:id', authenticateToken, requireAdmin, sectionController.getSectionById);

router.post('/', authenticateToken, requireAdmin, sectionController.createSection);
router.put('/:id', authenticateToken, requireAdmin, sectionController.updateSection);
router.delete('/:id', authenticateToken, requireAdmin, sectionController.softDeleteSection);

// Undelete section
router.patch('/undelete/:id', authenticateToken, requireAdmin, sectionController.undeleteSection);

module.exports = router; 