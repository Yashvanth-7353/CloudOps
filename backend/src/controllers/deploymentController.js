const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const gitService = require('../services/gitService');
const fs = require('fs');
const path = require('path');
const Deployment = require('../models/Deployment');

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
// --- UPGRADED FUNCTION: The Build Streamer & Tracker ---
const startBuild = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { repositoryName, repositoryOwner } = req.body;
        const userId = decoded.id;
        const io = req.app.get('io');

        // 1. Find the Project to link this deployment to
        const project = await Project.findOne({ repositoryName, repositoryOwner, userId });
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        // 2. Update Project status
        project.status = 'deploying';
        await project.save();

        // 3. Create the Deployment Record in MongoDB
        const deployment = new Deployment({
            projectId: project._id,
            userId: userId,
            repositoryName,
            repositoryOwner,
            status: 'building',
            phase: 'docker_build',
            startedAt: new Date(),
        });
        await deployment.save();

        // Respond OK immediately so the frontend knows the process started
        res.status(200).json({ message: 'Build engine started', deploymentId: deployment._id });

        // Helper to send logs to frontend AND save them to MongoDB
        const sendLog = async (text, type = 'info', source = 'system') => {
            const timestamp = new Date();
            // Emit to frontend Socket.io
            io.to(repositoryName).emit('build-log', { text, type, timestamp: timestamp.toISOString() });
            
            // Save to Database
            deployment.logs.push({ timestamp, source, level: type === 'error' ? 'error' : 'info', message: text });
            await deployment.save(); // Save incremently (in a real prod app, you might batch these saves)
        };

        // --- SIMULATED REAL-TIME DOCKER BUILD LOGS ---
        await sendLog('Initializing build container...', 'system');
        
        setTimeout(() => sendLog('Step 1/6 : FROM node:18-alpine', 'info', 'docker'), 2000);
        setTimeout(() => sendLog(' ---> 3f5d5c0e0b0a', 'info', 'docker'), 2500);
        
        setTimeout(() => sendLog('Step 2/6 : WORKDIR /app', 'info', 'docker'), 3000);
        setTimeout(() => sendLog(' ---> Running in 8b4d8a1c9e', 'info', 'docker'), 3500);
        
        setTimeout(() => sendLog('Step 3/6 : COPY package*.json ./', 'info', 'docker'), 4500);
        
        setTimeout(() => sendLog('Step 4/6 : RUN npm install', 'info', 'docker'), 5500);
        setTimeout(() => sendLog('added 245 packages, and audited 246 packages in 3s', 'success', 'docker'), 8000);
        
        setTimeout(() => sendLog('Step 5/6 : COPY . .', 'info', 'docker'), 9000);
        setTimeout(() => sendLog('Step 6/6 : EXPOSE 3000', 'info', 'docker'), 9500);
        
        setTimeout(async () => {
            await sendLog('Successfully built image cloudops-app:latest', 'success', 'docker');
            await sendLog('Pushing to AWS ECR...', 'system', 'ecr');
            deployment.updateStatus('pushing', 'push_ecr');
            await deployment.save();
        }, 11000);

        setTimeout(async () => {
            const publicUrl = `https://${repositoryName.toLowerCase()}.cloudops.app`;
            await sendLog(`Deployment LIVE at ${publicUrl}`, 'success', 'app');
            
            // Mark Deployment as Success
            const totalTime = Date.now() - deployment.startedAt.getTime();
            deployment.markAsSuccess(publicUrl, totalTime);
            await deployment.save();

            // Mark Project as Active
            project.status = 'active';
            await project.save();

            // Notify Frontend
            io.to(repositoryName).emit('build-complete', { status: 'success', url: publicUrl });
        }, 14000);

    } catch (error) {
        console.error('Start Build Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to start build engine.' });
        }
    }
};

module.exports = { initDeploy, saveDeploymentFiles, startBuild };
