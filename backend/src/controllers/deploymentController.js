const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const gitService = require('../services/gitService');
const frameworkDetector = require('../services/frameworkDetector');
const staticBuildService = require('../services/staticBuildService');
const fs = require('fs');
const path = require('path');

function getDirectoryTree(dirPath, depth = 0) {
    if (depth > 3) return [];
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return [];

    const result = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        if (file === '.git' || file === 'node_modules' || file === 'dist' || file === 'build') continue;
        const fullPath = path.join(dirPath, file);
        const isDir = fs.statSync(fullPath).isDirectory();
        result.push({
            name: file,
            type: isDir ? 'directory' : 'file',
            path: file,
            children: isDir ? getDirectoryTree(fullPath, depth + 1) : [],
        });
    }

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

        const clonePath = await gitService.cloneRepository(project.repositoryUrl, {
            githubToken: decoded.githubToken,
        });
        const fileTree = getDirectoryTree(clonePath);
        const suggestedRoots = await frameworkDetector.suggestRootDirectories(clonePath);

        res.status(200).json({
            success: true,
            clonePath,
            fileTree,
            suggestedRoots,
            defaultBranch: project.defaultBranch || 'main',
            repositoryName,
            repositoryOwner,
            message: 'Repository cloned successfully.',
        });
    } catch (error) {
        console.error('Init Deploy Error:', error);
        res.status(500).json({ error: error.message || 'Failed to initialize deployment.' });
    }
};

const detectFramework = async (req, res) => {
    try {
        const { clonePath, rootDirectory = './' } = req.body;

        if (!clonePath) return res.status(400).json({ error: 'Clone path is required.' });

        const normalizedRoot = rootDirectory === '/' || rootDirectory === '' ? './' : rootDirectory;
        const detection = await frameworkDetector.detectFramework(clonePath, {
            rootDirectory: normalizedRoot,
        });

        res.status(200).json({
            success: true,
            ...detection,
        });
    } catch (error) {
        console.error('Detect Framework Error:', error);
        res.status(500).json({ error: error.message || 'Failed to detect framework.' });
    }
};

const saveDeploymentFiles = async (req, res) => {
    try {
        const { clonePath, envContent, envPath, rootDirectory } = req.body;

        if (!clonePath) return res.status(400).json({ error: 'Clone path is required.' });

        const targetPath = rootDirectory && rootDirectory !== './'
            ? path.join(clonePath, rootDirectory.replace(/^\.\//, ''))
            : clonePath;

        if (envContent && envContent.trim() !== '') {
            const finalEnvPath = envPath || '.env';
            await gitService.writeFile(targetPath, finalEnvPath, envContent);
        }

        res.status(200).json({ success: true, message: 'Configuration saved.' });
    } catch (error) {
        console.error('Save Files Error:', error);
        res.status(500).json({ error: 'Failed to save configuration files.' });
    }
};

const startBuild = async (req, res) => {
    const {
        repositoryName,
        clonePath,
        rootDirectory = './',
        buildCommand,
        outputDirectory,
        environmentVariables = {},
        deployType = 'static',
    } = req.body;

    const io = req.app.get('io');

    if (!clonePath || !repositoryName) {
        return res.status(400).json({ error: 'clonePath and repositoryName are required.' });
    }

    res.status(200).json({ message: 'Build started' });

    const roomName = repositoryName;
    const sendLog = (text, type = 'info') => {
        io.to(roomName).emit('build-log', { text, type, timestamp: new Date().toISOString() });
    };

    const projectPath = rootDirectory && rootDirectory !== './'
        ? path.join(clonePath, rootDirectory.replace(/^\.\//, ''))
        : clonePath;

    try {
        if (deployType === 'static') {
            sendLog('Starting static frontend deployment...', 'system');
            sendLog(`Project directory: ${rootDirectory || './'}`, 'info');
            sendLog('No Docker or ECS required — building and publishing dist files to S3.', 'system');

            const detection = await frameworkDetector.detectFramework(clonePath, { rootDirectory });
            const finalBuildCommand = buildCommand || detection.buildCommand;
            const finalOutputDir = outputDirectory || detection.outputDirectory;

            if (!finalBuildCommand || finalBuildCommand.includes('No build needed')) {
                sendLog('Skipping build step and publishing existing static output.', 'system');
            } else {
                await staticBuildService.buildProject({
                    projectPath,
                    buildCommand: finalBuildCommand,
                    environmentVariables,
                    onLog: sendLog,
                });
            }

            sendLog('Publishing static assets to S3...', 'system');
            const siteSlug = staticBuildService.generateSiteSlug(repositoryName);
            const publicUrl = await staticBuildService.deployStaticToS3({
                projectPath,
                outputDirectory: finalOutputDir,
                siteSlug,
                onLog: sendLog,
            });

            const publicIp = await staticBuildService.resolvePublicIp(publicUrl);

            sendLog('Deployment complete!', 'success');
            sendLog(`Live URL: ${publicUrl}`, 'success');
            sendLog(`Public IP: ${publicIp || 'Unavailable'}`, 'success');

            io.to(roomName).emit('build-complete', {
                status: 'success',
                publicUrl,
                publicIp,
                siteSlug,
                deployType: 'static',
            });
        } else {
            sendLog('Container deployments (Docker/ECS) are not yet supported.', 'error');
            sendLog('For backend APIs, container support is coming soon. Use static deploy for frontends.', 'info');
            io.to(roomName).emit('build-complete', { status: 'failed' });
        }
    } catch (error) {
        console.error('Build Error:', error);
        sendLog(`Deployment failed: ${error.message}`, 'error');
        io.to(roomName).emit('build-complete', { status: 'failed', error: error.message });
    }
};

module.exports = { initDeploy, detectFramework, saveDeploymentFiles, startBuild };
