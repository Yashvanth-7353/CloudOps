const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Orchestrates the Docker build process
 * @param {string} repoName - Name of the repository
 * @param {string} repoPath - Path where the repo was cloned
 */
const buildImage = (repoName, repoPath) => {
    return new Promise((resolve, reject) => {
        const imageName = `${repoName.toLowerCase()}:latest`;
        
        console.log(`🐳 Starting Docker build for: ${imageName}...`);

        // 1. Basic Check: Does a Dockerfile exist?
        // In a future update, we can auto-generate one if it's missing.
        if (!fs.existsSync(path.join(repoPath, 'Dockerfile'))) {
            return reject(new Error('No Dockerfile found in repository.'));
        }

        // 2. Execute Docker Build Command
        // 'docker build -t <image-name> <path-to-code>'
        const cmd = `docker build -t ${imageName} "${repoPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Docker Build Error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`⚠️ Docker Build Warning: ${stderr}`);
            }
            
            console.log(`✅ Docker Build Successful: ${stdout}`);
            resolve({ imageName, stdout });
        });
    });
};

module.exports = { buildImage };