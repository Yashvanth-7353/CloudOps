const jwt = require('jsonwebtoken');

const getCurrentUserProfile = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            user: {
                id: String(decoded.id),
                username: decoded.username,
                email: decoded.email,
                avatar: decoded.avatar,
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {
    getCurrentUserProfile,
};