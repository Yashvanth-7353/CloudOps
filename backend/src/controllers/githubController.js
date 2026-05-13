const axios = require('axios');
const jwt = require('jsonwebtoken');

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

module.exports = {
    getRepositories,
};