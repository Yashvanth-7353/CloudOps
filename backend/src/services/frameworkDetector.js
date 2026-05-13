/**
 * Framework Detection Service
 * Identifies the technology stack of a repository
 * Supports: Node.js, Python, Go, Java, Ruby, PHP, Rust, .NET, Static
 */

const fs = require('fs').promises;
const path = require('path');

class FrameworkDetector {
  constructor() {
    this.frameworks = {
      nodejs: {
        indicators: ['package.json'],
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        port: 3000,
        dockerfile: 'nodejs',
        packageManager: 'npm',
      },
      python: {
        indicators: ['requirements.txt', 'setup.py', 'Pipfile', 'pyproject.toml'],
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'python app.py',
        port: 5000,
        dockerfile: 'python',
        packageManager: 'pip',
      },
      java: {
        indicators: ['pom.xml', 'build.gradle'],
        buildCommand: 'mvn clean package || gradle build',
        startCommand: 'java -jar target/*.jar',
        port: 8080,
        dockerfile: 'java',
        packageManager: 'maven',
      },
      go: {
        indicators: ['go.mod', 'go.sum'],
        buildCommand: 'go build -o app .',
        startCommand: './app',
        port: 8080,
        dockerfile: 'go',
        packageManager: 'go',
      },
      ruby: {
        indicators: ['Gemfile', 'Gemfile.lock'],
        buildCommand: 'bundle install',
        startCommand: 'bundle exec rails s',
        port: 3000,
        dockerfile: 'ruby',
        packageManager: 'bundler',
      },
      php: {
        indicators: ['composer.json', 'index.php'],
        buildCommand: 'composer install',
        startCommand: 'php -S 0.0.0.0:8000',
        port: 8000,
        dockerfile: 'php',
        packageManager: 'composer',
      },
      rust: {
        indicators: ['Cargo.toml', 'Cargo.lock'],
        buildCommand: 'cargo build --release',
        startCommand: './target/release/app',
        port: 8080,
        dockerfile: 'rust',
        packageManager: 'cargo',
      },
      dotnet: {
        indicators: ['*.csproj', '*.sln'],
        buildCommand: 'dotnet publish -c Release',
        startCommand: 'dotnet run',
        port: 5000,
        dockerfile: 'dotnet',
        packageManager: 'nuget',
      },
      static: {
        indicators: ['index.html'],
        buildCommand: 'echo "No build needed"',
        startCommand: 'echo "Static site"',
        port: 80,
        dockerfile: 'static',
        packageManager: 'none',
      },
    };
  }

  /**
   * Detect framework from repository structure
   * @param {string} repoPath - Path to repository
   * @returns {Promise<Object>} Detected framework info
   */
  async detectFramework(repoPath) {
    try {
      const detected = {
        framework: 'static', // default
        version: 'latest',
        buildCommand: 'echo "No build needed"',
        startCommand: 'echo "Static site"',
        port: 80,
        packageManager: 'none',
        confidence: 0,
        details: {},
      };

      // Check each framework
      for (const [frameworkName, config] of Object.entries(this.frameworks)) {
        const found = await this.checkFramework(repoPath, config.indicators);

        if (found) {
          detected.framework = frameworkName;
          detected.version = await this.getVersion(repoPath, frameworkName);
          detected.buildCommand = config.buildCommand;
          detected.startCommand = config.startCommand;
          detected.port = config.port;
          detected.packageManager = config.packageManager;
          detected.confidence = 1;
          detected.details = await this.getFrameworkDetails(repoPath, frameworkName);
          break;
        }
      }

      return detected;
    } catch (error) {
      console.error('Framework detection error:', error);
      throw new Error(`Failed to detect framework: ${error.message}`);
    }
  }

  /**
   * Check if framework indicators exist
   * @param {string} repoPath - Path to repository
   * @param {string[]} indicators - Files to check
   * @returns {Promise<boolean>}
   */
  async checkFramework(repoPath, indicators) {
    for (const indicator of indicators) {
      try {
        // Handle glob patterns
        if (indicator.includes('*')) {
          const files = await fs.readdir(repoPath);
          const pattern = indicator.replace('*.', '');
          if (files.some((f) => f.endsWith(pattern))) {
            return true;
          }
        } else {
          await fs.stat(path.join(repoPath, indicator));
          return true;
        }
      } catch (err) {
        // File doesn't exist, continue
      }
    }
    return false;
  }

  /**
   * Get framework version
   * @param {string} repoPath - Path to repository
   * @param {string} frameworkName - Framework name
   * @returns {Promise<string>} Version string
   */
  async getVersion(repoPath, frameworkName) {
    try {
      switch (frameworkName) {
        case 'nodejs': {
          const pkg = JSON.parse(
            await fs.readFile(path.join(repoPath, 'package.json'), 'utf-8')
          );
          return pkg.engines?.node || 'latest';
        }
        case 'python': {
          // Check for version specification in requirements or Pipfile
          const reqFile = path.join(repoPath, 'requirements.txt');
          try {
            const content = await fs.readFile(reqFile, 'utf-8');
            const pythonLine = content.split('\n').find((l) => l.startsWith('python'));
            return pythonLine ? pythonLine.split('==')[1] : '3.11';
          } catch {
            return '3.11';
          }
        }
        case 'java': {
          const pomFile = path.join(repoPath, 'pom.xml');
          try {
            const content = await fs.readFile(pomFile, 'utf-8');
            const match = content.match(/<java.version>(.*?)<\/java.version>/);
            return match ? match[1] : '17';
          } catch {
            return '17';
          }
        }
        case 'go': {
          const modFile = path.join(repoPath, 'go.mod');
          try {
            const content = await fs.readFile(modFile, 'utf-8');
            const match = content.match(/go (\d+\.\d+)/);
            return match ? match[1] : '1.21';
          } catch {
            return '1.21';
          }
        }
        default:
          return 'latest';
      }
    } catch (error) {
      return 'latest';
    }
  }

  /**
   * Get detailed framework information
   * @param {string} repoPath - Path to repository
   * @param {string} frameworkName - Framework name
   * @returns {Promise<Object>}
   */
  async getFrameworkDetails(repoPath, frameworkName) {
    try {
      const details = {
        hasDatabase: false,
        hasCaching: false,
        hasEnvironmentFile: false,
        scripts: {},
        dependencies: {},
      };

      switch (frameworkName) {
        case 'nodejs': {
          const pkgPath = path.join(repoPath, 'package.json');
          const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
          details.scripts = pkg.scripts || {};
          details.dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
          details.hasDatabase = this.hasKeyword(pkg, ['mongoose', 'sequelize', 'typeorm', 'knex']);
          details.hasCaching = this.hasKeyword(pkg, ['redis', 'memcached']);
          break;
        }
        case 'python': {
          const reqPath = path.join(repoPath, 'requirements.txt');
          try {
            const content = await fs.readFile(reqPath, 'utf-8');
            const deps = content.split('\n').map((l) => l.split('==')[0].trim()).filter(Boolean);
            details.dependencies = deps.reduce((acc, dep) => ({ ...acc, [dep]: '*' }), {});
            details.hasDatabase = deps.some((d) => ['sqlalchemy', 'psycopg2', 'pymongo'].includes(d));
            details.hasCaching = deps.some((d) => ['redis', 'memcached'].includes(d));
          } catch (err) {
            // No requirements file
          }
          break;
        }
      }

      // Check for .env file
      try {
        await fs.stat(path.join(repoPath, '.env'));
        details.hasEnvironmentFile = true;
      } catch {
        // No .env file
      }

      return details;
    } catch (error) {
      console.error('Error getting framework details:', error);
      return {};
    }
  }

  /**
   * Check if package.json has keywords
   * @param {Object} pkg - Package object
   * @param {string[]} keywords - Keywords to search
   * @returns {boolean}
   */
  hasKeyword(pkg, keywords) {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    return keywords.some((keyword) => allDeps[keyword]);
  }

  /**
   * Get Dockerfile template name for framework
   * @param {string} frameworkName - Framework name
   * @returns {string}
   */
  getDockerfileTemplate(frameworkName) {
    return this.frameworks[frameworkName]?.dockerfile || 'static';
  }
}

module.exports = new FrameworkDetector();
