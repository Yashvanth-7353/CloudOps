const express = require('express');
const { getCurrentUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/me', getCurrentUserProfile);

module.exports = router;