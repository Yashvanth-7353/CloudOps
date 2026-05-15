const express = require('express');
const jwt = require('jsonwebtoken');
const { runAzureDeployment } = require('../services/azureDeployService');

const router = express.Router();

// POST /api/azure/deploy
// Body: { repoUrl, appName, socketId }
router.post('/deploy', (req, res) => {
  const { repoUrl, appName, socketId } = req.body;

  if (!repoUrl || !appName) {
    return res.status(400).json({ error: 'repoUrl and appName are required' });
  }

  // Extract userId from JWT token
  let userId = 'anonymous';
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id || decoded.githubId || 'anonymous';
    } catch (err) {
      console.error('[Azure] Failed to decode JWT:', err.message);
    }
  }

  // Respond immediately — deployment runs async via socket.io
  res.status(202).json({ message: 'Azure deployment started', appName, socketId });

  // Get the io instance attached to the app
  const io = req.app.get('io');
  runAzureDeployment({ repoUrl, appName, socketId, io, userId });
});

module.exports = router;
