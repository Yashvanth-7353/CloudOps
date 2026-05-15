/**
 * Git Service
 * Handles repository cloning, pulling, and git operations
 */

const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class GitService {
  /**
   * Clone repository with retry logic
   * @param {string} repoUrl - Git repository URL
   * @param {string} targetPath - Target directory path
   * @param {Object} options - Clone options
   * @returns {Promise<Object>}
   */
  async cloneRepository(repoUrl, targetPath, options = {}) {
    try {
      const { depth = 1, branch = 'main', timeout = 300000, maxRetries = 3 } = options;

      // Create target directory if it doesn't exist
      await fs.mkdir(targetPath, { recursive: true });

      let lastError;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const git = simpleGit();

          const cloneOptions = ['--depth', String(depth)];
          if (branch) {
            cloneOptions.push('--branch', branch);
          }
          cloneOptions.push('--single-branch');

          const startTime = Date.now();

          await git.clone(repoUrl, targetPath, cloneOptions);

          const duration = Date.now() - startTime;

          return {
            success: true,
            path: targetPath,
            message: `Repository cloned successfully in ${(duration / 1000).toFixed(2)}s`,
            duration,
            attempt,
          };
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            console.warn(`Clone attempt ${attempt} failed, retrying...`, error.message);
            // Wait before retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }

      throw lastError;
    } catch (error) {
      throw new Error(`Failed to clone repository after multiple attempts: ${error.message}`);
    }
  }

  /**
   * Fetch repository metadata
   * @param {string} repoPath - Path to repository
   * @returns {Promise<Object>}
   */
  async getRepositoryInfo(repoPath) {
    try {
      const git = simpleGit(repoPath);

      // Get latest commit
      const commits = await git.log(['-1']);
      const latestCommit = commits.latest;

      // Get current branch
      const branchSummary = await git.branchLocal();
      const currentBranch = branchSummary.current;

      // Get remote URL
      let remoteUrl = '';
      try {
        const remotes = await git.getRemotes(true);
        remoteUrl = remotes[0]?.refs?.fetch || '';
      } catch (err) {
        // No remote
      }

      // Get status
      const status = await git.status();

      return {
        success: true,
        latestCommit: {
          hash: latestCommit.hash,
          shortHash: latestCommit.hash.substring(0, 7),
          message: latestCommit.message,
          author: latestCommit.author_name,
          email: latestCommit.author_email,
          date: new Date(latestCommit.date),
        },
        currentBranch,
        remoteUrl,
        status: {
          ahead: status.ahead,
          behind: status.behind,
          files: status.files.length,
          conflicted: status.conflicted.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error.message}`);
    }
  }

  /**
   * Get repository size
   * @param {string} repoPath - Path to repository
   * @returns {Promise<number>} Size in bytes
   */
  async getRepositorySize(repoPath) {
    try {
      const { stdout } = await execAsync(`du -sb "${repoPath}"`, { shell: '/bin/bash' });
      const sizeBytes = parseInt(stdout.split('\t')[0]);
      return sizeBytes;
    } catch (error) {
      // Fallback for Windows or if du is not available
      return 0;
    }
  }

  /**
   * Get repository file count
   * @param {string} repoPath - Path to repository
   * @returns {Promise<number>}
   */
  async getFileCount(repoPath) {
    try {
      const { stdout } = await execAsync(`find "${repoPath}" -type f | wc -l`, { shell: '/bin/bash' });
      return parseInt(stdout.trim());
    } catch (error) {
      // Fallback
      return 0;
    }
  }

  /**
   * Cleanup repository (remove .git folder, node_modules, etc)
   * @param {string} repoPath - Path to repository
   * @param {Object} options - Cleanup options
   * @returns {Promise<Object>}
   */
  async cleanupRepository(repoPath, options = {}) {
    try {
      const { removeGit = false, removeDependencies = true } = options;

      // Remove .git folder if requested
      if (removeGit) {
        const gitDir = path.join(repoPath, '.git');
        try {
          await fs.rm(gitDir, { recursive: true, force: true });
        } catch (err) {
          console.warn('Failed to remove .git:', err);
        }
      }

      // Remove dependency folders
      if (removeDependencies) {
        const folderToRemove = [
          'node_modules',
          '__pycache__',
          '.pytest_cache',
          'target',
          'build',
          'dist',
          '.gradle',
          'vendor',
        ];

        for (const folder of folderToRemove) {
          const folderPath = path.join(repoPath, folder);
          try {
            await fs.rm(folderPath, { recursive: true, force: true });
          } catch (err) {
            // Folder doesn't exist, skip
          }
        }
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to cleanup repository: ${error.message}`);
    }
  }

  /**
   * Remove entire repository
   * @param {string} repoPath - Path to repository
   * @returns {Promise<Object>}
   */
  async removeRepository(repoPath) {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to remove repository: ${error.message}`);
    }
  }

  /**
   * List files in repository (excluding certain folders)
   * @param {string} repoPath - Path to repository
   * @param {Array} exclude - Folders to exclude
   * @returns {Promise<Array>}
   */
  async listFiles(repoPath, exclude = ['.git', 'node_modules', '.env']) {
    try {
      const files = [];
      const defaultExclude = ['.git', 'node_modules', '.venv', '__pycache__', 'dist', 'build'];
      const excludeList = [...defaultExclude, ...exclude];

      const walkDir = async (dir) => {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            if (excludeList.includes(entry.name)) {
              continue;
            }

            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(repoPath, fullPath);

            if (entry.isDirectory()) {
              await walkDir(fullPath);
            } else {
              files.push(relativePath);
            }
          }
        } catch (err) {
          // Skip if no permission
        }
      };

      await walkDir(repoPath);
      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Check if path exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async pathExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new GitService();
