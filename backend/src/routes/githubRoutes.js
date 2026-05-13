const express = require('express');
const { getRepositories } = require('../controllers/githubController');

const router = express.Router();

router.get('/repos', getRepositories);

module.exports = router;