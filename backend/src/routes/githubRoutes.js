const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/repos', authMiddleware, githubController.getRepositories);
router.post('/connect', authMiddleware, githubController.connectRepository);
// Add this line with your other routes
router.delete('/disconnect/:owner/:repo', githubController.removeRepository);

module.exports = router;