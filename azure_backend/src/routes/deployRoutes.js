const express = require('express');
const router = express.Router();

// This is the exact URL GitHub is knocking on: /api/deploy/webhook
router.post('/deploy/webhook', (req, res) => {
    // GitHub tells us what kind of event just happened in the headers
    const event = req.headers['x-github-event'];

    console.log(`\n🔔 GitHub Webhook Triggered! Event type: ${event}`);

    // 1. Handle the initial "Ping" test when the webhook is first created
    if (event === 'ping') {
        console.log('✅ GitHub successfully pinged our server!');
        return res.status(200).json({ message: 'Pong! CloudOps webhook is alive and well.' });
    }

    // 2. Handle actual code pushes (We will add the Docker build logic here later)
    if (event === 'push') {
        const repoName = req.body.repository?.name;
        const pusherName = req.body.pusher?.name;
        console.log(`🚀 Code pushed to ${repoName} by ${pusherName}! Ready to deploy...`);
        
        return res.status(200).json({ message: 'Push received. Deployment queued.' });
    }

    // Always return a 200 status so GitHub knows we received it, even if we don't care about the event
    return res.status(200).json({ message: 'Event acknowledged but ignored.' });
});

module.exports = router;