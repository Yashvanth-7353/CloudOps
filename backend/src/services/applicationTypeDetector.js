/**
 * Detects user-facing application type from a cloned repository.
 */

const path = require('path');
const fs = require('fs').promises;
const frameworkDetector = require('./frameworkDetector');
const { getRecommendation } = require('../config/deploymentMapping');

const BACKEND_INDICATORS = [
  { file: 'requirements.txt', label: 'Python' },
  { file: 'pyproject.toml', label: 'Python' },
  { file: 'manage.py', label: 'Django' },
  { file: 'main.py', label: 'Python API' },
  { file: 'app.py', label: 'Flask/FastAPI' },
  { file: 'pom.xml', label: 'Spring Boot' },
  { file: 'build.gradle', label: 'Spring Boot' },
  { file: 'go.mod', label: 'Go API' },
  { file: 'Cargo.toml', label: 'Rust API' },
];

const FRONTEND_DIRS = ['frontend', 'client', 'web', 'app', 'ui'];

class ApplicationTypeDetector {
  async pathExists(targetPath) {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  async isBackendRoot(dirPath) {
    for (const { file, label } of BACKEND_INDICATORS) {
      if (await this.pathExists(path.join(dirPath, file))) {
        return { isBackend: true, label };
      }
    }

    try {
      const pkgPath = path.join(dirPath, 'package.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const backendDeps = ['express', 'fastify', 'koa', '@nestjs/core', 'hapi'];
      if (backendDeps.some((d) => deps[d])) {
        return { isBackend: true, label: 'Node.js API' };
      }
      const hasFrontendOnly = deps.react || deps.vue || deps['@angular/core'] || deps.vite;
      const hasBuildScript = pkg.scripts?.build && !backendDeps.some((d) => deps[d]);
      if (hasFrontendOnly && hasBuildScript) {
        return { isBackend: false, label: null };
      }
      if (backendDeps.some((d) => deps[d])) {
        return { isBackend: true, label: 'Node.js API' };
      }
    } catch {
      // no package.json
    }

    return { isBackend: false, label: null };
  }

  async isFrontendRoot(dirPath) {
    const preset = await frameworkDetector.detectFrontendPreset(dirPath);
    if (preset) {
      return { isFrontend: true, label: preset.displayName };
    }

    if (await this.pathExists(path.join(dirPath, 'index.html'))) {
      return { isFrontend: true, label: 'Static HTML' };
    }

    return { isFrontend: false, label: null };
  }

  async analyzeRoot(clonePath, rootDirectory = './') {
    const targetPath = rootDirectory && rootDirectory !== './'
      ? path.join(clonePath, rootDirectory.replace(/^\.\//, ''))
      : clonePath;

    const [frontend, backend] = await Promise.all([
      this.isFrontendRoot(targetPath),
      this.isBackendRoot(targetPath),
    ]);

    return {
      path: rootDirectory || './',
      frontend,
      backend,
    };
  }

  async detect(clonePath) {
    const suggestedRoots = await frameworkDetector.suggestRootDirectories(clonePath);
    const rootsToScan = suggestedRoots.length > 0
      ? suggestedRoots.map((r) => r.path)
      : ['./'];

    const uniqueRoots = [...new Set(rootsToScan)];
    const analyses = await Promise.all(
      uniqueRoots.map((root) => this.analyzeRoot(clonePath, root))
    );

    let hasFrontend = false;
    let hasBackend = false;
    const detectedFrameworks = [];
    let primaryRoot = './';

    for (const analysis of analyses) {
      if (analysis.frontend.isFrontend) {
        hasFrontend = true;
        primaryRoot = analysis.path;
        if (analysis.frontend.label) detectedFrameworks.push(analysis.frontend.label);
      }
      if (analysis.backend.isBackend) {
        hasBackend = true;
        if (!hasFrontend) primaryRoot = analysis.path;
        if (analysis.backend.label) detectedFrameworks.push(analysis.backend.label);
      }
    }

    // Root-level combined check (monorepo with frontend/ + backend/ folders)
    if (!hasFrontend || !hasBackend) {
      for (const dir of FRONTEND_DIRS) {
        const sub = path.join(clonePath, dir);
        if (await this.pathExists(sub)) {
          const subAnalysis = await this.analyzeRoot(clonePath, dir);
          if (subAnalysis.frontend.isFrontend) {
            hasFrontend = true;
            if (subAnalysis.frontend.label) detectedFrameworks.push(subAnalysis.frontend.label);
          }
        }
      }
    }

    let applicationType = 'frontend-website';
    let confidence = 0.7;

    if (hasFrontend && hasBackend) {
      applicationType = 'full-stack';
      confidence = 0.9;
    } else if (hasBackend && !hasFrontend) {
      applicationType = 'backend-api';
      confidence = 0.85;
    } else if (hasFrontend) {
      applicationType = 'frontend-website';
      confidence = 0.9;
    } else {
      // Fallback to framework detector at repo root
      const dockerDetection = await frameworkDetector.detectDockerFramework(clonePath);
      if (['python', 'java', 'go', 'ruby', 'php', 'rust', 'dotnet'].includes(dockerDetection.framework)) {
        applicationType = 'backend-api';
        detectedFrameworks.push(dockerDetection.framework);
        confidence = 0.6;
      }
    }

    const uniqueFrameworks = [...new Set(detectedFrameworks)];
    const recommendation = getRecommendation(applicationType, {
      detectedFrameworks: uniqueFrameworks,
      confidence,
    });

    return {
      applicationType,
      confidence,
      primaryRoot,
      detectedFrameworks: uniqueFrameworks,
      suggestedRoots,
      analyses,
      recommendation,
    };
  }
}

module.exports = new ApplicationTypeDetector();
