const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/', (req, res) => {
    res.send('🚀 CloudOps Backend is running!');
});

// --- PLACEHOLDER ROUTES ---

// 1. GitHub OAuth Route (Phase 1)
// STEP 1: Redirect user to GitHub's login page
app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,admin:repo_hook`;
    res.redirect(githubAuthUrl);
});

// STEP 2 & 3: GitHub sends the user back here with a ?code=...
app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided from GitHub');
    }

    try {
        // Exchange the temporary code for an Access Token
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = response.data.access_token;

        if (accessToken) {
            console.log('✅ Access Token Secured:', accessToken);
            
            // For now, we return it to the browser. 
            // Later, you will save this to your database.
            res.json({ 
                message: "Authentication Successful", 
                token: accessToken 
            });
        } else {
            res.status(400).json({ error: "Failed to get access token" });
        }

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).send('Authentication Failed');
    }
});

// 2. Webhook Listener (Phase 2)
app.post('/api/webhook', (req, res) => {
    res.json({ message: "Webhook received" });
});

// 3. Predictive Cost Engine (Phase 3 - Research Core)
app.post('/api/predict-cost', (req, res) => {
    // Math logic for your paper goes here
    res.json({ message: "Cost calculation logic will live here" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});