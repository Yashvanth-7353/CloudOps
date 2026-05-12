const express = require('express');
const router = express.Router();
const verifyGitHubWebhook = require('../middleware/webhookValidator');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const git = simpleGit();

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

    console.log(`📦 New push detected! Cloning ${repoName}...`);

    try {
        // Clear previous clone if it exists
        if (fs.existsSync(downloadPath)) {
            fs.rmSync(downloadPath, { recursive: true, force: true });
        }

        // Clone the repository
        await git.clone(repoUrl, downloadPath);
        console.log(`✅ ${repoName} cloned successfully to ${downloadPath}`);

        // TODO: Next step - Trigger Docker Build here!
        
        res.status(200).send('Clone successful. Build triggered.');
    } catch (err) {
        console.error('❌ Cloning failed:', err);
        res.status(500).send('Internal Server Error during cloning');
    }
});

module.exports = router;