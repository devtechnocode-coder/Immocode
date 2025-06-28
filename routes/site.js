const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes (authentication and admin role required)
router.get('/', authenticateToken, requireAdmin, siteController.getAllSites);
router.get('/deleted', authenticateToken, requireAdmin, siteController.getDeletedSites);
router.get('/count', authenticateToken, requireAdmin, siteController.countAllSites);
router.get('/count/entreprise/:id_entreprise', authenticateToken, requireAdmin, siteController.countSitesByEntrepriseId);
router.get('/count/entreprise-name/:name', authenticateToken, requireAdmin, siteController.countSitesByEntrepriseName);
router.get('/name/:name', authenticateToken, requireAdmin, siteController.getSiteByName);
router.get('/entreprise/:id_entreprise', authenticateToken, requireAdmin, siteController.getSiteByEntrepriseId);
router.get('/entreprise-name/:name', authenticateToken, requireAdmin, siteController.getSiteByEntrepriseName);
router.get('/:id', authenticateToken, requireAdmin, siteController.getSiteById);

router.post('/', authenticateToken, requireAdmin, siteController.createSite);
router.put('/:id', authenticateToken, requireAdmin, siteController.updateSite);
router.delete('/:id', authenticateToken, requireAdmin, siteController.softDeleteSite);

// Undelete site
router.patch('/undelete/:id', authenticateToken, requireAdmin, siteController.undeleteSite);

module.exports = router; 