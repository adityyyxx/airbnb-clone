const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

// GET /experiences  -> list all experiences
router.get('/', experienceController.getExperiences);

// GET /experiences/add -> show add form
router.get('/add', experienceController.getAddExperience);

// POST /experiences/add -> save new experience
router.post('/add', experienceController.postAddExperience);

module.exports = router;