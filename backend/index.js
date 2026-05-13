const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const githubRoutes = require('./src/routes/githubRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const userRoutes = require('./src/routes/userRoutes');
const deployRoutes = require('./src/routes/deployRoutes');
const deploymentRoutes = require('./src/routes/deploymentRoutes');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/api', deployRoutes);
app.use('/api/deploy', deploymentRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});