const express = require('express');
const {
    githubAuthRedirect,
    githubCallbackHandler,
    verifyToken,
    login,
    logout,
} = require('../controllers/authController');

const router = express.Router();

router.get('/github', githubAuthRedirect);
router.get('/github/callback', githubCallbackHandler);
router.get('/verify', verifyToken);
router.post('/logout', logout);
router.post('/login', login);

module.exports = router;