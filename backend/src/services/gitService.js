const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class GitService {
    buildAuthenticatedUrl(repoUrl, githubToken) {
        if (!githubToken || !repoUrl.startsWith('https://github.com/')) {
            return repoUrl;
        }
        return repoUrl.replace('https://github.com/', `https://x-access-token:${githubToken}@github.com/`);
    }

    async cloneRepository(repoUrl, options = {}) {
        const tempDirName = crypto.randomBytes(16).toString('hex');
        const clonePath = path.join(__dirname, '../../temp', tempDirName);

        await fs.mkdir(path.join(__dirname, '../../temp'), { recursive: true });

        const cloneUrl = this.buildAuthenticatedUrl(repoUrl, options.githubToken);
        console.log(`Cloning into ${clonePath}...`);
        const git = simpleGit();

        await git.clone(cloneUrl, clonePath, ['--depth', '1']);

        return clonePath;
    }

    async checkFileExists(targetPath, filename) {
        try {
            await fs.access(path.join(targetPath, filename));
            return true;
        } catch {
            return false;
        }
    }

    async writeFile(targetPath, filename, content) {
        const fullPath = path.join(targetPath, filename);
        // Ensure directory path exists if filename includes subdirs (e.g., config/.env)
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf8');
        return true;
    }
}

module.exports = new GitService();