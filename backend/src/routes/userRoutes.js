const express = require('express');
const { getCurrentUserProfile, getProfile, updateSettings, getSettings } = require('../controllers/userController');

const router = express.Router();

router.get('/me', getCurrentUserProfile);
router.get('/profile', getProfile);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

module.exports = router;
