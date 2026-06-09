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

  async detectFrontendPreset(repoPath) {
    try {
      const pkgPath = path.join(repoPath, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const scripts = pkg.scripts || {};
      const defaultBuild = scripts.build ? 'npm run build' : 'npm run build';

      const presets = [
        { name: 'vite', check: () => deps.vite, output: 'dist', build: defaultBuild },
        { name: 'nextjs', check: () => deps.next, output: 'out', build: defaultBuild },
        { name: 'create-react-app', check: () => deps['react-scripts'], output: 'build', build: defaultBuild },
        { name: 'angular', check: () => deps['@angular/core'], output: 'dist', build: defaultBuild },
        { name: 'vue', check: () => deps.vue && !deps.nuxt, output: 'dist', build: defaultBuild },
        { name: 'nuxt', check: () => deps.nuxt, output: '.output/public', build: defaultBuild },
        { name: 'svelte', check: () => deps['@sveltejs/kit'] || deps.svelte, output: 'build', build: defaultBuild },
        { name: 'astro', check: () => deps.astro, output: 'dist', build: defaultBuild },
      ];

      for (const preset of presets) {
        if (preset.check()) {
          return {
            preset: preset.name,
            buildCommand: preset.build,
            outputDirectory: preset.output,
            deployType: 'static',
            displayName: this.getPresetDisplayName(preset.name),
          };
        }
      }

      if (scripts.build) {
        return {
          preset: 'nodejs',
          buildCommand: scripts.build.startsWith('npm') ? scripts.build : 'npm run build',
          outputDirectory: 'dist',
          deployType: 'static',
          displayName: 'Node.js',
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  getPresetDisplayName(preset) {
    const names = {
      vite: 'Vite',
      nextjs: 'Next.js',
      'create-react-app': 'Create React App',
      angular: 'Angular',
      vue: 'Vue.js',
      nuxt: 'Nuxt.js',
      svelte: 'SvelteKit',
      astro: 'Astro',
      nodejs: 'Node.js',
      static: 'Static HTML',
    };
    return names[preset] || preset;
  }

  async getSuggestedEnvVars(repoPath) {
    const candidates = ['.env.example', '.env.local.example', '.env.sample', 'env.example'];
    const suggested = [];

    for (const file of candidates) {
      try {
        const content = await fs.readFile(path.join(repoPath, file), 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex > 0) {
            const key = trimmed.slice(0, eqIndex).trim();
            const value = trimmed.slice(eqIndex + 1).trim();
            if (key && !suggested.some((s) => s.key === key)) {
              suggested.push({
                key,
                value: value || '',
                isPublic: key.startsWith('VITE_') || key.startsWith('NEXT_PUBLIC_') || key.startsWith('REACT_APP_'),
              });
            }
          }
        }
        if (suggested.length > 0) break;
      } catch {
        // continue
      }
    }

    return suggested;
  }

  async suggestRootDirectories(repoPath, maxDepth = 2) {
    const suggestions = [];

    const scan = async (dir, relativePath, depth) => {
      if (depth > maxDepth) return;

      const hasPackageJson = await this.checkFramework(dir, ['package.json']);
      const hasIndexHtml = await this.checkFramework(dir, ['index.html']);

      if (hasPackageJson || hasIndexHtml) {
        suggestions.push({
          path: relativePath || './',
          label: relativePath || 'Root (./)',
          hasPackageJson,
        });
      }

      if (depth < maxDepth) {
        try {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) continue;
            const childPath = path.join(dir, entry.name);
            const childRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
            await scan(childPath, childRelative, depth + 1);
          }
        } catch {
          // ignore
        }
      }
    };

    await scan(repoPath, '', 0);
    return suggestions.length > 0 ? suggestions : [{ path: './', label: 'Root (./)', hasPackageJson: false }];
  }

  /**
   * Detect framework from repository structure
   * @param {string} repoPath - Path to repository
   * @param {Object} options - { rootDirectory?: string, mode?: 'static' | 'docker' }
   * @returns {Promise<Object>} Detected framework info
   */
  async detectFramework(repoPath, options = {}) {
    const isStaticMode = options.mode === 'static' || options.rootDirectory != null;
    if (isStaticMode) {
      return this.detectStaticFramework(repoPath, options);
    }
    return this.detectDockerFramework(repoPath);
  }

  async detectStaticFramework(repoPath, options = {}) {
    try {
      const rootDirectory = options.rootDirectory || '';
      const targetPath = rootDirectory && rootDirectory !== './'
        ? path.join(repoPath, rootDirectory.replace(/^\.\//, ''))
        : repoPath;

      const detected = {
        framework: 'static',
        preset: 'static',
        displayName: 'Static HTML',
        version: 'latest',
        buildCommand: null,
        installCommand: 'npm install',
        outputDirectory: 'dist',
        deployType: 'static',
        startCommand: 'echo "Static site"',
        port: 80,
        packageManager: 'npm',
        confidence: 0,
        details: {},
        suggestedEnvVars: [],
        rootDirectory: rootDirectory || './',
      };

      const preset = await this.detectFrontendPreset(targetPath);
      if (preset) {
        detected.framework = 'nodejs';
        detected.preset = preset.preset;
        detected.displayName = preset.displayName;
        detected.buildCommand = preset.buildCommand;
        detected.outputDirectory = preset.outputDirectory;
        detected.deployType = preset.deployType;
        detected.confidence = 1;
        detected.details = await this.getFrameworkDetails(targetPath, 'nodejs');
        detected.suggestedEnvVars = await this.getSuggestedEnvVars(targetPath);
        return detected;
      }

      for (const [frameworkName, config] of Object.entries(this.frameworks)) {
        const found = await this.checkFramework(targetPath, config.indicators);

        if (found) {
          detected.framework = frameworkName;
          detected.preset = frameworkName;
          detected.displayName = this.getPresetDisplayName(frameworkName);
          detected.version = await this.getVersion(targetPath, frameworkName);
          detected.buildCommand = config.buildCommand;
          detected.startCommand = config.startCommand;
          detected.port = config.port;
          detected.packageManager = config.packageManager;
          detected.deployType = frameworkName === 'static' ? 'static' : 'container';
          detected.outputDirectory = frameworkName === 'static' ? '.' : 'dist';
          detected.confidence = 1;
          detected.details = await this.getFrameworkDetails(targetPath, frameworkName);
          detected.suggestedEnvVars = await this.getSuggestedEnvVars(targetPath);
          break;
        }
      }

      return detected;
    } catch (error) {
      console.error('Framework detection error:', error);
      throw new Error(`Failed to detect framework: ${error.message}`);
    }
  }

  async detectDockerFramework(repoPath) {
    try {
      const detected = {
        framework: 'static',
        version: 'latest',
        buildCommand: 'echo "No build needed"',
        startCommand: 'echo "Static site"',
        port: 80,
        packageManager: 'none',
        confidence: 0,
        details: {},
      };

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
