const express = require('express');
const router = express.Router();
const verifyGitHubWebhook = require('../middleware/webhookValidator');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const git = simpleGit();

const { buildImage } = require('../services/dockerService');

router.post('/webhook', verifyGitHubWebhook, async (req, res) => {


    // 1. Catch the initial GitHub Ping event
    if (req.headers['x-github-event'] === 'ping') {
        console.log('🏓 GitHub Ping received successfully!');
        return res.status(200).send('Ping acknowledged');
    }


    const { repository, ref } = req.body;

    // 2. Only trigger if push is to the 'main' branch
    if (ref !== 'refs/heads/main') {
        console.log('⚠️ Push was not to main branch. Ignoring.');
        return res.status(200).send('Not a push to main branch. Skipping.');
    }

    const repoUrl = repository.clone_url;
    const repoName = repository.name;
    const downloadPath = path.join(__dirname, '../../temp', repoName);

    // 🚀 THE FIX: Reply to GitHub IMMEDIATELY (Status 202 means "Accepted for processing")
    res.status(202).send('Webhook received. Build pipeline started in the background.');

    console.log(`📦 New push detected! Cloning ${repoName}...`);

    try {
        // Clear previous clone if it exists
        if (fs.existsSync(downloadPath)) {
            fs.rmSync(downloadPath, { recursive: true, force: true });
        }

        // Clone the repository
        await git.clone(repoUrl, downloadPath);
        console.log(`✅ ${repoName} cloned successfully to ${downloadPath}`);

        // NEW: Trigger Docker Build
        const buildResult = await buildImage(repoName, downloadPath);
        
        console.log(`🚀 Image ${buildResult.imageName} is ready for deployment!`);

        // (You can't do res.send() here anymore because you already sent it above)
        // Later, this is where you will update your database so your React UI 
        // changes from "Building..." to "Live!"
    } catch (err) {
        console.error('❌ Pipeline failed:', err);
        res.status(500).send('Pipeline failed during build.');
    }

});

module.exports = router;