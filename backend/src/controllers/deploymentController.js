const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const gitService = require('../services/gitService');
const deploymentEngine = require('../services/deploymentEngineService');
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

async function resolveDeploymentContext(req) {
    const token = req.headers.authorization?.split(' ')[1];
    const body = req.body || {};

    let decoded = null;
    if (token) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    const userId = decoded?.id != null ? String(decoded.id) : (body.userId != null ? String(body.userId) : null);

    if (body.projectId) {
        const project = await Project.findById(body.projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        return {
            project,
            userId: String(project.userId || userId || ''),
            repositoryUrl: project.repositoryUrl,
            repositoryName: project.repositoryName,
        };
    }

    if (body.repositoryName && body.repositoryOwner) {
        const query = {
            repositoryName: body.repositoryName,
            repositoryOwner: body.repositoryOwner,
        };

        if (userId) {
            query.userId = userId;
        }

        const project = await Project.findOne(query);
        if (project) {
            return {
                project,
                userId: String(project.userId || userId || ''),
                repositoryUrl: project.repositoryUrl,
                repositoryName: project.repositoryName,
            };
        }
    }

    return {
        project: null,
        userId,
        repositoryUrl: body.repositoryUrl,
        repositoryName: body.repositoryName,
    };
}

const initDeploy = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { repositoryName, repositoryOwner } = req.body;
        const userId = String(decoded.id);

        const project = await Project.findOne({ repositoryName, repositoryOwner, userId });
        if (!project) return res.status(404).json({ error: 'Project must be connected before deploying.' });

        // 1. Clone the repository
        const clonePath = await gitService.cloneRepository(project.repositoryUrl);

        // 2. Check for Dockerfile & Get File Tree
        const hasDockerfile = await gitService.checkFileExists(clonePath, 'Dockerfile');
        const fileTree = getDirectoryTree(clonePath);

        res.status(200).json({
            success: true,
            projectId: project._id,
            repositoryUrl: project.repositoryUrl,
            repositoryName: project.repositoryName,
            repositoryOwner: project.repositoryOwner,
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
        // This endpoint is deprecated - users should commit files to their repository instead
        return res.status(200).json({ 
            success: true, 
            message: 'Please commit your Dockerfile to your Git repository. Deployment will use the Dockerfile from your repo.',
            note: 'User-provided files during preview are no longer supported. Ensure your repo has a Dockerfile at the root.'
        });
    } catch (error) {
        console.error('Save Files Error:', error);
        res.status(500).json({ error: 'Failed to save configuration files.' });
    }
}

const startBuild = async (req, res) => {
    const io = req.app.get('io');

    try {
        const context = await resolveDeploymentContext(req);
        
        // Ensure we have repositoryUrl - try multiple sources
        let repositoryUrl = context.repositoryUrl || context.project?.repositoryUrl || req.body.repositoryUrl;
        
        // If we have repositoryName and repositoryOwner but no URL, construct it
        if (!repositoryUrl && req.body.repositoryName && req.body.repositoryOwner) {
            repositoryUrl = `https://github.com/${req.body.repositoryOwner}/${req.body.repositoryName}.git`;
        }
        
        // Final validation - repositoryUrl is absolutely required
        if (!repositoryUrl) {
            return res.status(400).json({
                success: false,
                error: 'repositoryUrl, projectId, or (repositoryName + repositoryOwner) is required to start deployment',
            });
        }

        const result = await deploymentEngine.startDeployment({
            projectId: context.project?._id || req.body.projectId,
            userId: context.userId,
            repositoryUrl,
            repositoryName: context.repositoryName || context.project?.repositoryName || req.body.repositoryName,
            branch: req.body.branch || req.body.ref?.replace('refs/heads/', '') || 'main',
            environmentVariables: req.body.environmentVariables || context.project?.environmentVariables || {},
            target: req.body.target || req.body.ec2Target || req.body.remoteTarget || {},
            triggeredBy: req.body.triggeredBy || 'manual',
            webhookId: req.body.webhookId || context.project?.githubWebhookId || null,
        }, io);

        return res.status(202).json({
            success: true,
            message: 'Deployment queued successfully.',
            ...result,
        });
    } catch (error) {
        console.error('Start deployment error:', error);
        return res.status(400).json({
            success: false,
            error: error.message || 'Failed to start deployment',
        });
    }
};

const getDeploymentStatus = async (req, res) => {
    try {
        const deployment = await deploymentEngine.getDeploymentDetails(req.params.deploymentId);
        return res.status(200).json({ success: true, deployment });
    } catch (error) {
        return res.status(404).json({ success: false, error: error.message });
    }
};

const getDeploymentLogs = async (req, res) => {
    try {
        const logs = await deploymentEngine.getDeploymentLogs(req.params.deploymentId, {
            source: req.query.source || null,
            level: req.query.level || null,
            limit: Number(req.query.limit || 100),
            skip: Number(req.query.skip || 0),
        });

        return res.status(200).json({ success: true, logs });
    } catch (error) {
        return res.status(404).json({ success: false, error: error.message });
    }
};

const stopDeployment = async (req, res) => {
    try {
        const result = await deploymentEngine.stopDeployment(req.params.deploymentId, req.app.get('io'));
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

const restartDeployment = async (req, res) => {
    try {
        const result = await deploymentEngine.restartDeployment(req.params.deploymentId, req.app.get('io'));
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

const handleWebhook = async (req, res) => {
    try {
        const repository = req.body.repository || {};
        const cloneUrl = repository.clone_url || repository.ssh_url || '';
        const project = await Project.findOne({
            $or: [
                cloneUrl ? { repositoryUrl: cloneUrl } : null,
                repository.name && repository.owner?.login ? {
                    repositoryName: repository.name,
                    repositoryOwner: repository.owner.login,
                } : null,
            ].filter(Boolean),
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'No matching project found for webhook' });
        }

        const signature = req.headers['x-hub-signature-256'];
        const isValid = deploymentEngine.verifyWebhookSignature(req.rawBody, project.webhookSecret, signature);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Webhook signature verification failed' });
        }

        if (req.headers['x-github-event'] !== 'push') {
            return res.status(200).json({ success: true, message: 'Webhook acknowledged' });
        }

        const result = await deploymentEngine.handleWebhook(req.body, req.app.get('io'));
        return res.status(202).json({ success: true, message: 'Webhook accepted and redeployment queued', ...result });
    } catch (error) {
        console.error('Webhook handling error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Start AWS EC2 deployment
 * POST /api/deploy/aws-ec2
 * Body: {
 *   repositoryUrl: string,
 *   repositoryName?: string,
 *   branch?: string,
 *   instanceType?: string (default: t3.micro),
 *   keyName?: string,
 *   securityGroupIds?: string[],
 *   environmentVariables?: object
 * }
 */
const startAWSEC2Deployment = async (req, res) => {
  const io = req.app.get('io');

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const {
      repositoryUrl,
      repositoryName,
      repositoryOwner,
      branch = 'main',
      instanceType = 't3.micro',
      keyName,
      securityGroupIds = [],
      environmentVariables = {},
    } = req.body;

    if (!repositoryUrl || !repositoryName) {
      return res.status(400).json({
        success: false,
        error: 'repositoryUrl and repositoryName are required for AWS EC2 deployment',
      });
    }

    // Decode JWT to get userId
    let userId = 'anonymous';
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded.githubId || 'anonymous';
      } catch (err) {
        console.warn('Could not decode token:', err.message);
      }
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`☁️  AWS EC2 DEPLOYMENT REQUEST`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`📦 Repository: ${repositoryUrl}`);
    console.log(`🌿 Branch: ${branch}`);
    console.log(`📍 Instance Type: ${instanceType}`);
    console.log(`🔑 Key Name: ${keyName || 'default'}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`${'═'.repeat(60)}\n`);

    // Try to find existing project in MongoDB
    let project = null;
    if (repositoryOwner) {
      project = await Project.findOne({
        repositoryName,
        repositoryOwner,
        userId,
      });
    } else {
      // Try to extract owner from URL: https://github.com/owner/repo.git
      const urlMatch = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (urlMatch) {
        const [, owner, repo] = urlMatch;
        project = await Project.findOne({
          repositoryName: repo,
          repositoryOwner: owner,
          userId,
        });
      }
    }

    // If no project found, it's okay - we can still deploy
    // But we'll log it
    if (!project) {
      console.log(`⚠️  Project not found in database for ${repositoryName}. Creating temporary deployment without project link.`);
    }

    const result = await deploymentEngine.startDeployment({
      projectId: project?._id || null,  // Can be null for ad-hoc deployments
      userId,
      repositoryUrl,
      repositoryName,
      repositoryOwner: repositoryOwner || 'unknown',
      branch,
      environmentVariables,
      target: {
        type: 'aws',
        awsRegion: process.env.AWS_REGION || 'ap-south-1',
        instanceType,
        keyName: keyName || process.env.AWS_EC2_KEY_NAME,
        securityGroupIds,
      },
      triggeredBy: 'manual',
    }, io);

    console.log(`✅ AWS EC2 deployment initiated: ${result.deploymentId}`);

    return res.status(202).json({
      success: true,
      message: 'AWS EC2 deployment initiated',
      deploymentId: result.deploymentId,
      status: result.status,
    });

  } catch (error) {
    console.error('❌ AWS EC2 deployment error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to start AWS EC2 deployment',
    });
  }
};

module.exports = {
    initDeploy,
    saveDeploymentFiles,
    startBuild,
    startAWSEC2Deployment,
    getDeploymentStatus,
    getDeploymentLogs,
    stopDeployment,
    restartDeployment,
    handleWebhook,
};
