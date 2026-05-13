const axios = require('axios');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const githubService = require('../services/githubService');

const getRepositories = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.githubToken) {
            return res.status(400).json({ error: 'GitHub account is not connected' });
        }

        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                Authorization: `Bearer ${decoded.githubToken}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'CloudOps-App',
            },
            params: {
                visibility: 'all',
                affiliation: 'owner,collaborator,organization_member',
                sort: 'updated',
                per_page: 100,
            },
        });

        const repositories = response.data.map((repository) => ({
            id: String(repository.id),
            name: repository.name,
            fullName: repository.full_name,
            description: repository.description,
            language: repository.language,
            updatedAt: repository.updated_at,
            htmlUrl: repository.html_url,
            cloneUrl: repository.clone_url,
            isPrivate: repository.private,
            defaultBranch: repository.default_branch,
        }));

        res.json({ repositories });
    } catch (error) {
        console.error('Failed to fetch GitHub repositories:', error);
        const status = error.response?.status || 500;
        res.status(status).json({ error: 'Unable to fetch GitHub repositories' });
    }
};

const connectRepository = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.githubToken) {
            return res.status(400).json({ error: 'GitHub account is not connected' });
        }

        const { repositoryName, repositoryOwner, repositoryUrl, isPrivate, description } = req.body;
        const userId = decoded.id; 

        // 1. Verify project isn't already connected
        const existingProject = await Project.findOne({ repositoryName, repositoryOwner, userId });
        if (existingProject) {
            return res.status(400).json({ error: 'Repository is already connected.' });
        }

        // ADDED LOG HERE
        console.log(`Attempting to create webhook for: ${repositoryOwner}/${repositoryName}`);

        // 2. Create the webhook on GitHub using the token from JWT
        const webhookResult = await githubService.createWebhook(
            repositoryOwner, 
            repositoryName, 
            decoded.githubToken
        );

        // 3. Save the new Project configuration to MongoDB
        const newProject = new Project({
            userId,
            repositoryName,
            repositoryOwner,
            repositoryUrl,
            isPrivate: isPrivate || false,
            description: description || '',
            status: 'connected',
            githubWebhookId: webhookResult.webhookId,
            webhookSecret: webhookResult.webhookSecret,
        });

        await newProject.save();

        res.status(201).json({
            success: true,
            message: 'Repository connected and automated deployment webhook created.',
            project: {
                id: newProject._id,
                repositoryName: newProject.repositoryName,
                status: newProject.status
            }
        });

    } catch (error) {
        console.error('Failed to connect repository:', error);
        const status = error.response?.status || 500;
        res.status(status).json({ error: error.message || 'Unable to connect repository' });
    }
};

module.exports = {
    getRepositories,
    connectRepository, 
};