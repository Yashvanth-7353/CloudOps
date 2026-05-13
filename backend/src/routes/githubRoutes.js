const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/repos', authMiddleware, githubController.getRepositories);
router.post('/connect', authMiddleware, githubController.connectRepository);

module.exports = router;