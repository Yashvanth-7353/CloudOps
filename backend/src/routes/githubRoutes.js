const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

// Get repositories from GitHub API (user's own GitHub repos)
router.get('/repos', authMiddleware, githubController.getRepositories);

// Get connected repositories from MongoDB (repos connected to CloudOps)
router.get('/connected', authMiddleware, githubController.getConnectedRepositories);

// Connect a repository (create webhook + save to DB)
router.post('/connect', authMiddleware, githubController.connectRepository);

// Disconnect a repository (remove webhook + delete from DB)
router.delete('/disconnect/:owner/:repo', authMiddleware, githubController.removeRepository);

module.exports = router;