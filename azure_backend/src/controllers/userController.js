const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Deployment = require('../models/Deployment');

const decodeToken = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) { res.status(401).json({ error: 'No token provided' }); return null; }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        res.status(401).json({ error: 'Invalid token' }); return null;
    }
};

const getCurrentUserProfile = (req, res) => {
    const decoded = decodeToken(req, res);
    if (!decoded) return;
    res.json({
        user: {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            avatar: decoded.avatar,
        }
    });
};

const getProfile = async (req, res) => {
    const decoded = decodeToken(req, res);
    if (!decoded) return;
    try {
        const user = await User.findOne({ githubId: String(decoded.id) });
        const totalDeployments = await Deployment.countDocuments({ userId: String(decoded.id) });

        res.json({
            id: decoded.id,
            username: user?.username || decoded.username,
            email: user?.email || decoded.email || null,
            avatar: user?.avatarUrl || decoded.avatar || null,
            createdAt: user?.createdAt?.toISOString() || null,
            lastLogin: user?.lastLogin?.toISOString() || null,
            totalDeployments,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const getSettings = async (req, res) => {
    const decoded = decodeToken(req, res);
    if (!decoded) return;
    try {
        const user = await User.findOne({ githubId: String(decoded.id) });
        res.json({ settings: user?.settings || { notificationsEnabled: true, theme: 'dark', defaultDeploymentRegion: 'us-east-1' } });
    } catch {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

const updateSettings = async (req, res) => {
    const decoded = decodeToken(req, res);
    if (!decoded) return;
    try {
        const update = {};
        for (const key of ['notificationsEnabled', 'theme', 'defaultDeploymentRegion']) {
            if (req.body[key] !== undefined) update[`settings.${key}`] = req.body[key];
        }
        const user = await User.findOneAndUpdate(
            { githubId: String(decoded.id) },
            { $set: update },
            { new: true }
        );
        res.json({ success: true, settings: user?.settings });
    } catch {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

module.exports = {
    getCurrentUserProfile,
    getProfile,
    updateSettings,
    getSettings,
};
