const express = require('express');
const { runAzureDeployment } = require('../services/azureDeployService');

const router = express.Router();

// POST /api/azure/deploy
// Body: { repoUrl, appName, socketId }
router.post('/deploy', (req, res) => {
  const { repoUrl, appName, socketId } = req.body;

  if (!repoUrl || !appName) {
    return res.status(400).json({ error: 'repoUrl and appName are required' });
  }

  // Respond immediately — deployment runs async via socket.io
  res.status(202).json({ message: 'Azure deployment started', appName, socketId });

  // Get the io instance attached to the app
  const io = req.app.get('io');
  runAzureDeployment({ repoUrl, appName, socketId, io });
});

module.exports = router;
