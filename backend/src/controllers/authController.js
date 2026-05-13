const axios = require('axios');
const jwt = require('jsonwebtoken');

const githubAuthRedirect = (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,admin:repo_hook&state=${state}`;
    res.redirect(githubAuthUrl);
};

const githubCallbackHandler = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code provided from GitHub');
    }

    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
        }, {
            headers: { Accept: 'application/json' }
        });

        const accessToken = response.data.access_token;

        if (!accessToken) {
            return res.status(400).json({ error: 'Failed to get access token' });
        }

        console.log('✅ Access Token Secured:', accessToken);

        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': 'CloudOps-App'
            }
        });

        const user = userResponse.data;

        const jwtToken = jwt.sign(
            {
                id: user.id,
                username: user.login,
                email: user.email,
                avatar: user.avatar_url,
                githubToken: accessToken,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

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
    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).send('Authentication Failed');
    }
};

const verifyToken = (req, res) => {
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
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    res.json({
        message: 'Email login not yet implemented. Use GitHub OAuth instead.',
        token: null,
    });
};

const logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

module.exports = {
    githubAuthRedirect,
    githubCallbackHandler,
    verifyToken,
    login,
    logout,
};