const express = require('express');
const router = express.Router();
const entrepriseController = require('../controllers/entrepriseController');

router.post('/', entrepriseController.createEntreprise);
router.put('/:id', entrepriseController.updateEntreprise);
router.delete('/:id', entrepriseController.softDeleteEntreprise);
router.get('/', entrepriseController.getAllEntreprises);
router.get('/count', entrepriseController.countEntreprises);
router.get('/name/:name', entrepriseController.getEntrepriseByName);
router.get('/:id', entrepriseController.getEntrepriseById);

module.exports = router; 