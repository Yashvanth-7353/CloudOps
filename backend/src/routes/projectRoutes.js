const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// List all projects for the signed-in user
router.get('/', authMiddleware, projectController.getProjects);

// Update project (partial updates allowed)
router.put('/:id', authMiddleware, projectController.updateProject);
// Get project details
router.get('/:id', authMiddleware, projectController.getProject);

module.exports = router;
