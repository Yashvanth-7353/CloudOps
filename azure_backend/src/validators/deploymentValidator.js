/**
 * Deployment Request Validators
 * Validates incoming deployment requests
 */

class DeploymentValidator {
  /**
   * Validate start deployment request
   * POST /api/deploy/start
   */
  validateStartDeployment(req, res, next) {
    const { projectId, repositoryUrl, branch } = req.body;

    const errors = [];

    // Validate projectId
    if (!projectId) {
      errors.push('projectId is required');
    } else if (!/^[a-f0-9]{24}$/.test(projectId)) {
      errors.push('projectId must be a valid MongoDB ObjectId');
    }

    // Validate repositoryUrl
    if (!repositoryUrl) {
      errors.push('repositoryUrl is required');
    } else if (!this.isValidGitUrl(repositoryUrl)) {
      errors.push('repositoryUrl must be a valid Git repository URL');
    }

    // Validate branch
    if (branch && !this.isValidBranchName(branch)) {
      errors.push('branch must be a valid Git branch name');
    }

    // Validate environmentVariables
    const { environmentVariables } = req.body;
    if (environmentVariables) {
      if (typeof environmentVariables !== 'object' || Array.isArray(environmentVariables)) {
        errors.push('environmentVariables must be an object');
      } else {
        // Validate each env var
        for (const [key, value] of Object.entries(environmentVariables)) {
          if (!this.isValidEnvKey(key)) {
            errors.push(`Invalid environment variable name: ${key}`);
          }
          if (typeof value !== 'string' && typeof value !== 'number') {
            errors.push(`Environment variable ${key} must be string or number`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  }

  /**
   * Check if URL is valid Git repository
   * @private
   */
  isValidGitUrl(url) {
    // GitHub HTTPS
    if (/^https:\/\/github\.com\/[\w-]+\/[\w.-]+(?:\.git)?$/.test(url)) {
      return true;
    }
    // GitHub SSH
    if (/^git@github\.com:[\w-]+\/[\w.-]+(?:\.git)?$/.test(url)) {
      return true;
    }
    // Generic git URL
    if (/^(https?:\/\/).+\.git$/.test(url)) {
      return true;
    }
    // SSH
    if (/^git@[^:]+:[^/]+\/[^/]+$/.test(url)) {
      return true;
    }
    return false;
  }

  /**
   * Check if branch name is valid
   * @private
   */
  isValidBranchName(branch) {
    // Git branch name rules:
    // - Cannot start with '.'
    // - Cannot end with '/'
    // - Cannot contain spaces, ~, ^, :, ?, *
    // - Cannot contain '..'
    const regex = /^(?!\.)[a-zA-Z0-9/_-]+(?<!\/)$/;
    return regex.test(branch) && !branch.includes('..');
  }

  /**
   * Check if environment variable key is valid
   * @private
   */
  isValidEnvKey(key) {
    // Environment variable names should be alphanumeric and underscores
    return /^[A-Z_][A-Z0-9_]*$/i.test(key);
  }
}

module.exports = new DeploymentValidator();
