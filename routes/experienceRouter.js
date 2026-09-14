const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const isAuth = require('../middleware/is-auth');

// GET /experiences  -> list all experiences
router.get('/', experienceController.getExperiences);

// GET /experiences/add -> show add form (requires auth)
router.get('/add', isAuth, experienceController.getAddExperience);

// POST /experiences/add -> save new experience (requires auth)
router.post('/add', isAuth, experienceController.postAddExperience);

module.exports = router;