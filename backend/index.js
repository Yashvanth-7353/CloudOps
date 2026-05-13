const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

const deployRoutes = require('./src/routes/deployRoutes');

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
const githubAuthRedirect = (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,admin:repo_hook&state=${state}`;
    res.redirect(githubAuthUrl);
};

app.get('/auth/github', githubAuthRedirect);
app.get('/api/auth/github', githubAuthRedirect);

// STEP 2 & 3: GitHub sends the user back here with a ?code=...
const githubCallbackHandler = async (req, res) => {
    const { code, state } = req.query;

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
            
            // Get user info from GitHub
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'CloudOps-App'
                }
            });

            const user = userResponse.data;
            
            // Create JWT token
            const jwtToken = jwt.sign(
                { 
                    id: user.id,
                    username: user.login,
                    email: user.email,
                    avatar: user.avatar_url,
                    githubToken: accessToken
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

                        // Redirect to frontend with token using a browser-side navigation.
                        // This avoids iframe/frame navigation issues in hosted browser flows.
                        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
                        const redirectUrl = `${frontendUrl}/login?token=${encodeURIComponent(jwtToken)}`;

                        res.status(200).send(`
                            <!doctype html>
                            <html>
                                <head>
                                    <meta charset="utf-8" />
                                    <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
                                    <title>Signing you in</title>
                                    <style>
                                        body {
                                            margin: 0;
                                            min-height: 100vh;
                                            display: grid;
                                            place-items: center;
                                            background: #06070f;
                                            color: white;
                                            font-family: Arial, sans-serif;
                                        }
                                        .card {
                                            padding: 24px 28px;
                                            border: 1px solid rgba(255,255,255,0.1);
                                            border-radius: 20px;
                                            background: rgba(255,255,255,0.06);
                                            backdrop-filter: blur(12px);
                                        }
                                    </style>
                                </head>
                                <body>
                                    <div class="card">Signing you in...</div>
                                    <script>
                                        window.location.replace(${JSON.stringify(redirectUrl)});
                                    </script>
                                </body>
                            </html>
                        `);
        } else {
            res.status(400).json({ error: "Failed to get access token" });
        }

    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).send('Authentication Failed');
    }
};

app.get('/auth/github/callback', githubCallbackHandler);
app.get('/api/auth/github/callback', githubCallbackHandler);


// Verify JWT token
app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Fetch the authenticated user's GitHub repositories
app.get('/api/github/repos', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.githubToken) {
            return res.status(400).json({ error: 'GitHub account is not connected' });
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${decoded.githubToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'CloudOps-App',
            },
            params: {
                visibility: 'all',
                affiliation: 'owner,collaborator,organization_member',
                sort: 'updated',
                per_page: 100,
            },
        });

        const repositories = response.data.map((repository) => ({
            id: String(repository.id),
            name: repository.name,
            fullName: repository.full_name,
            description: repository.description,
            language: repository.language,
            updatedAt: repository.updated_at,
            htmlUrl: repository.html_url,
            cloneUrl: repository.clone_url,
            isPrivate: repository.private,
            defaultBranch: repository.default_branch,
        }));

        res.json({ repositories });
    } catch (error) {
        console.error('Failed to fetch GitHub repositories:', error);
        const status = error.response?.status || 500;
        res.status(status).json({ error: 'Unable to fetch GitHub repositories' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Email/password login (placeholder)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    // This is a placeholder - implement real auth logic if needed
    res.json({ 
        message: 'Email login not yet implemented. Use GitHub OAuth instead.',
        token: null 
    });
});

// Get current user profile
app.get('/api/users/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ 
            user: {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email,
                avatar: decoded.avatar,
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'CloudOps backend is healthy',
        timestamp: new Date().toISOString()
    });
});

// Placeholder endpoints for deployments
app.get('/api/deployments', (req, res) => {
    res.json({ deployments: [] });
});

app.post('/api/deployments/create', (req, res) => {
    res.status(201).json({ 
        message: 'Deployment creation endpoint',
        data: { id: 'deployment_' + Date.now() }
    });
});

app.get('/api/deployments/:id', (req, res) => {
    res.json({ deployment: { id: req.params.id } });
});

app.get('/api/deployments/:id/logs', (req, res) => {
    res.json({ logs: [] });
});

app.get('/api/deployments/:id/status', (req, res) => {
    res.json({ status: 'idle' });
});

// Placeholder endpoints for analytics
app.get('/api/analytics/dashboard', (req, res) => {
    res.json({ 
        deployments: 0,
        uptime: '99.9%',
        totalCost: 0
    });
});

app.get('/api/analytics/deployments', (req, res) => {
    res.json({ data: [] });
});

app.get('/api/analytics/costs', (req, res) => {
    res.json({ data: [] });
});

app.get('/api/analytics/performance', (req, res) => {
    res.json({ data: [] });
});

// Placeholder endpoints for billing
app.get('/api/billing/usage', (req, res) => {
    res.json({ usage: 0 });
});

app.get('/api/billing/plans', (req, res) => {
    res.json({ plans: [] });
});

app.post('/api/billing/update-plan', (req, res) => {
    res.json({ message: 'Plan updated' });
});

// 2. Webhook Listener (Phase 2)
app.use('/api', deployRoutes);

// 3. Predictive Cost Engine (Phase 3 - Research Core)
app.post('/api/predict-cost', (req, res) => {
    // Math logic for your paper goes here
    res.json({ message: "Cost calculation logic will live here" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});