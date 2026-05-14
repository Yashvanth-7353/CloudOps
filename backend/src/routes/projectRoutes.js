const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Update project (partial updates allowed)
router.put('/:id', authMiddleware, projectController.updateProject);
// Get project details
router.get('/:id', authMiddleware, projectController.getProject);

module.exports = router;
