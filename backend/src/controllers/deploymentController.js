const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const gitService = require('../services/gitService');
const fs = require('fs');
const path = require('path');

// Helper function to read the directory structure
function getDirectoryTree(dirPath, depth = 0) {
    if (depth > 2) return []; // Limit depth so we don't crash reading huge node_modules
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return [];
    
    const result = [];
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        if (file === '.git' || file === 'node_modules') continue;
        const fullPath = path.join(dirPath, file);
        const isDir = fs.statSync(fullPath).isDirectory();
        result.push({
            name: file,
            type: isDir ? 'directory' : 'file',
            children: isDir ? getDirectoryTree(fullPath, depth + 1) : []
        });
    }
    // Sort directories first, then files
    return result.sort((a, b) => (a.type === 'directory' ? -1 : 1));
}

const initDeploy = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { repositoryName, repositoryOwner } = req.body;
        const userId = decoded.id;

        const project = await Project.findOne({ repositoryName, repositoryOwner, userId });
        if (!project) return res.status(404).json({ error: 'Project must be connected before deploying.' });

        // 1. Clone the repository
        const clonePath = await gitService.cloneRepository(project.repositoryUrl);

        // 2. Check for Dockerfile & Get File Tree
        const hasDockerfile = await gitService.checkFileExists(clonePath, 'Dockerfile');
        const fileTree = getDirectoryTree(clonePath);

        res.status(200).json({
            success: true,
            clonePath,
            hasDockerfile,
            fileTree, // <-- Sending the folder structure to the frontend!
            message: 'Repository cloned successfully.'
        });

    } catch (error) {
        console.error('Init Deploy Error:', error);
        res.status(500).json({ error: 'Failed to initialize deployment.' });
    }
};

const saveDeploymentFiles = async (req, res) => {
    try {
        const { clonePath, envContent, envPath, dockerfileContent } = req.body;

        if (!clonePath) return res.status(400).json({ error: 'Clone path is required.' });

        // 1. Save .env file if the user provided one
        if (envContent && envContent.trim() !== '') {
            const finalEnvPath = envPath || '.env'; 
            await gitService.writeFile(clonePath, finalEnvPath, envContent);
            console.log(`✅ Saved .env to ${finalEnvPath}`);
        }

        // 2. Save Dockerfile if it was missing and the user provided one
        if (dockerfileContent && dockerfileContent.trim() !== '') {
            await gitService.writeFile(clonePath, 'Dockerfile', dockerfileContent);
            console.log(`✅ Saved new Dockerfile`);
        }

        res.status(200).json({ success: true, message: 'Files configured! Ready for Docker build.' });

    } catch (error) {
        console.error('Save Files Error:', error);
        res.status(500).json({ error: 'Failed to save configuration files.' });
    }
}

// --- NEW FUNCTION: The Build Streamer ---
const startBuild = async (req, res) => {
    const { repositoryName } = req.body;
    const io = req.app.get('io'); // Get the socket instance

    // We immediately respond OK to the API request
    res.status(200).json({ message: 'Build engine started' });

    // Helper to send logs to the specific frontend room
    const sendLog = (text, type = 'info') => {
        io.to(repositoryName).emit('build-log', { text, type, timestamp: new Date().toISOString() });
    };

    // --- SIMULATED REAL-TIME DOCKER BUILD LOGS ---
    // (In the future, you will replace these setTimeout blocks with real Dockerode commands)
    sendLog('Initializing build container...', 'system');
    
    setTimeout(() => sendLog('Step 1/6 : FROM node:18-alpine', 'info'), 2000);
    setTimeout(() => sendLog(' ---> 3f5d5c0e0b0a', 'info'), 2500);
    
    setTimeout(() => sendLog('Step 2/6 : WORKDIR /app', 'info'), 3000);
    setTimeout(() => sendLog(' ---> Running in 8b4d8a1c9e', 'info'), 3500);
    
    setTimeout(() => sendLog('Step 3/6 : COPY package*.json ./', 'info'), 4500);
    
    setTimeout(() => sendLog('Step 4/6 : RUN npm install', 'info'), 5500);
    setTimeout(() => sendLog('npm WARN deprecated ...', 'error'), 6500); // Show a mock warning
    setTimeout(() => sendLog('added 245 packages, and audited 246 packages in 3s', 'success'), 8000);
    
    setTimeout(() => sendLog('Step 5/6 : COPY . .', 'info'), 9000);
    
    setTimeout(() => sendLog('Step 6/6 : EXPOSE 3000', 'info'), 9500);
    
    setTimeout(() => {
        sendLog('Successfully built image cloudops-app:latest', 'success');
        sendLog('Pushing to AWS ECR...', 'system');
    }, 11000);

    setTimeout(() => {
        sendLog('Deployment LIVE. Application routing configured.', 'success');
        io.to(repositoryName).emit('build-complete', { status: 'success' });
    }, 14000);
};

module.exports = { initDeploy, saveDeploymentFiles, startBuild };
