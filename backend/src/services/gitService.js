const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const fssync = require('fs');
const crypto = require('crypto');
const { sanitizeError } = require('../utils/logSanitizer');

class GitService {
    buildAuthenticatedUrl(repoUrl, githubToken) {
        if (!githubToken || !repoUrl.startsWith('https://github.com/')) {
            return repoUrl;
        }
        return repoUrl.replace('https://github.com/', `https://x-access-token:${githubToken}@github.com/`);
    }

    async cloneRepository(repoUrl, targetPathOrOptions = {}, maybeOptions = {}) {
        let clonePath = null;
        let options = maybeOptions;

        if (typeof targetPathOrOptions === 'string') {
            clonePath = targetPathOrOptions;
        } else {
            options = targetPathOrOptions || {};
        }

        const {
            branch = null,
            depth = 1,
            maxRetries = 3,
            githubToken = null,
        } = options;

        const cloneUrl = this.buildAuthenticatedUrl(repoUrl, githubToken);

        if (!clonePath) {
            const tempDirName = crypto.randomBytes(16).toString('hex');
            clonePath = path.join(__dirname, '../../temp', tempDirName);
        }

        // Ensure the temp directory exists
        await fs.mkdir(path.join(__dirname, '../../temp'), { recursive: true });
        await fs.mkdir(path.dirname(clonePath), { recursive: true });

        console.log(`Cloning into ${clonePath}...`);
        const git = simpleGit();

        const branchCandidates = [];
        if (branch) branchCandidates.push(branch);
        branchCandidates.push('main', 'master');

        const attempts = Math.max(maxRetries, branchCandidates.length);
        
        // Shallow clone (--depth 1) makes it incredibly fast because it only downloads the latest code
        let lastError = null;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            const selectedBranch = branchCandidates[Math.min(attempt, branchCandidates.length - 1)];
            try {
                const args = ['--depth', String(depth)];
                if (selectedBranch) {
                    args.push('--branch', selectedBranch);
                }

                await git.clone(cloneUrl, clonePath, args);
                return clonePath;
            } catch (error) {
                lastError = error;
                const message = error?.message || '';
                const branchMissing = /Remote branch .* not found|couldn't find remote ref|branch .* not found/i.test(message);
                await fs.rm(clonePath, { recursive: true, force: true }).catch(() => {});

                if (!branchMissing && attempt < attempts - 1) {
                    continue;
                }

                if (branchMissing && attempt < attempts - 1) {
                    continue;
                }
            }
        }

        throw sanitizeError(lastError || new Error('Failed to clone repository'));

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

    async getRepositoryInfo(repoPath) {
        const git = simpleGit(repoPath);
        const [status, log, branchSummary] = await Promise.all([
            git.status(),
            git.log({ maxCount: 1 }),
            git.branch(),
        ]);

        const latestCommit = log.latest || {};
        return {
            currentBranch: branchSummary.current,
            latestCommit: {
                hash: latestCommit.hash || '',
                shortHash: (latestCommit.hash || '').slice(0, 7),
                message: latestCommit.message || '',
                author: latestCommit.author_name || latestCommit.author?.name || '',
                date: latestCommit.date || new Date().toISOString(),
            },
            isClean: status.isClean(),
            files: status.files.length,
        };
    }

    async getRepositorySize(repoPath) {
        const walk = async (currentPath) => {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            let total = 0;

            for (const entry of entries) {
                if (entry.name === '.git' || entry.name === 'node_modules') {
                    continue;
                }

                const fullPath = path.join(currentPath, entry.name);
                if (entry.isDirectory()) {
                    // eslint-disable-next-line no-await-in-loop
                    total += await walk(fullPath);
                } else {
                    // eslint-disable-next-line no-await-in-loop
                    const stats = await fs.stat(fullPath);
                    total += stats.size;
                }
            }

            return total;
        };

        return walk(repoPath);
    }

    async removeRepository(repoPath) {
        await fs.rm(repoPath, { recursive: true, force: true });
        return true;
    }
}

module.exports = new GitService();