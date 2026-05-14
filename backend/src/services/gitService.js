const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class GitService {
    async cloneRepository(repoUrl) {
        // Generate a unique folder name for this deployment
        const tempDirName = crypto.randomBytes(16).toString('hex');
        const clonePath = path.join(__dirname, '../../temp', tempDirName);

        // Ensure the temp directory exists
        await fs.mkdir(path.join(__dirname, '../../temp'), { recursive: true });

        console.log(`Cloning into ${clonePath}...`);
        const git = simpleGit();
        
        // Shallow clone (--depth 1) makes it incredibly fast because it only downloads the latest code
        await git.clone(repoUrl, clonePath, ['--depth', '1']); 

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