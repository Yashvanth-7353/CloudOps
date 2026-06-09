/**
 * Static Build Service
 * Builds frontend projects and deploys dist output to S3 — no Docker/ECS required.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const dns = require('dns').promises;
const { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { maskSecrets } = require('../utils/logSanitizer');

class StaticBuildService {
  constructor() {
    this.sitesDir = path.join(__dirname, '../../public/sites');
    this.s3Region = process.env.AWS_REGION || 'us-east-1';
    this.s3Client = new S3Client({
      region: this.s3Region,
      credentials: {
        accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim(),
        secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim(),
      },
    });
  }

  async verifyBucketAccess(bucket, onLog = () => {}) {
    const probeKey = `cloudops-access-probe-${Date.now()}.txt`;
    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: probeKey,
        Body: 'cloudops-probe',
        ContentType: 'text/plain',
      }));
      onLog('S3 bucket write permission verified.', 'success');
    } catch (error) {
      const code = error.name || 'UnknownError';
      const httpStatus = error.$metadata?.httpStatusCode;
      onLog(`S3 PutObject denied on bucket "${bucket}" (${code}${httpStatus ? `, HTTP ${httpStatus}` : ''}).`, 'error');
      throw new Error(
        `S3 upload permission denied for bucket "${bucket}" in region "${this.s3Region}". `
        + 'Your IAM user needs s3:PutObject on arn:aws:s3:::'
        + `${bucket}/* and s3:ListBucket on arn:aws:s3:::${bucket}. `
        + 'Confirm AWS_REGION matches the bucket region and credentials are for the bucket owner account.'
      );
    }
  }

  getEnhancedPath(cwd) {
    const localBin = path.join(cwd, 'node_modules', '.bin');
    const nodeBin = path.dirname(process.execPath);
    const segments = [localBin, nodeBin, process.env.PATH].filter(Boolean);
    return [...new Set(segments.join(path.delimiter).split(path.delimiter))].join(path.delimiter);
  }

  runCommand(command, args, cwd, env = {}, onLog = () => {}) {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      // Windows: npm/yarn/pnpm are .cmd shims; Node 20+ often requires shell:true to spawn them.
      const proc = spawn(command, args, {
        cwd,
        env: {
          ...process.env,
          ...env,
          CI: 'true',
          FORCE_COLOR: '0',
          PATH: this.getEnhancedPath(cwd),
        },
        shell: isWindows,
        windowsHide: true,
      });

      const handleData = (data, level) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach((line) => onLog(line, level));
      };

      proc.stdout.on('data', (d) => handleData(d, 'info'));
      proc.stderr.on('data', (d) => handleData(d, 'info'));

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      });

      proc.on('error', (err) => {
        if (err.code === 'ENOENT') {
          reject(new Error(
            `Could not run "${command}". Ensure Node.js and npm are installed and on PATH. `
            + `On Windows, restart the backend from a terminal where "npm -v" works. (${err.message})`
          ));
          return;
        }
        reject(err);
      });
    });
  }

  getInstallEnv(environmentVariables = {}) {
    const { NODE_ENV, ...rest } = environmentVariables;
    return {
      ...rest,
      NODE_ENV: 'development',
      NPM_CONFIG_PRODUCTION: 'false',
      YARN_PRODUCTION: 'false',
    };
  }

  getBackendApiUrl() {
    return process.env.BACKEND_PUBLIC_URL
      || process.env.API_PUBLIC_URL
      || `http://localhost:${process.env.PORT || 5000}`;
  }

  getBuildEnv(environmentVariables = {}, siteSlug = null) {
    const backendApiUrl = this.getBackendApiUrl();
    const env = {
      ...environmentVariables,
      VITE_API_URL: environmentVariables.VITE_API_URL || backendApiUrl,
      REACT_APP_API_URL: environmentVariables.REACT_APP_API_URL || backendApiUrl,
    };

    if (siteSlug) {
      const normalizedBase = `/${siteSlug.replace(/^\/+|\/+$/g, '')}/`;
      env.VITE_BASE = normalizedBase;
    }

    return env;
  }

  getStaticHostRuntimeScript(apiBaseUrl) {
    const normalizedApiBase = (apiBaseUrl || '').replace(/\/+$/g, '');
    if (!normalizedApiBase) return '';

    return `<script data-cloudops-static-host="true">
      (function () {
        var apiBase = ${JSON.stringify(normalizedApiBase)};
        var shouldRewrite = function (url) {
          return typeof url === 'string' && /^\\/api(?:\\/|$)/.test(url);
        };
        var rewrite = function (url) {
          return apiBase + url;
        };

        window.__CLOUDOPS_API_BASE__ = apiBase;

        if (window.fetch) {
          var nativeFetch = window.fetch.bind(window);
          window.fetch = function (input, init) {
            if (shouldRewrite(input)) {
              return nativeFetch(rewrite(input), init);
            }

            if (window.Request && input instanceof Request) {
              var parsed = new URL(input.url, window.location.origin);
              var relativeUrl = parsed.pathname + parsed.search + parsed.hash;
              if (shouldRewrite(relativeUrl)) {
                return nativeFetch(new Request(rewrite(relativeUrl), input), init);
              }
            }

            return nativeFetch(input, init);
          };
        }

        if (window.XMLHttpRequest) {
          var nativeOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function (method, url) {
            if (shouldRewrite(url)) {
              arguments[1] = rewrite(url);
            }
            return nativeOpen.apply(this, arguments);
          };
        }
      })();
    </script>`;
  }

  sanitizeIndexHtml(html, basePath = '/', apiBaseUrl = this.getBackendApiUrl()) {
    let output = html;

    output = output.replace(
      /<link[^>]+href=["'](?:[^"']*\/)?src\/styles\.css["'][^>]*>\s*/gi,
      ''
    );

    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    if (!/<base\s/i.test(output)) {
      output = output.replace(/<head([^>]*)>/i, `<head$1>\n    <base href="${normalizedBase}">`);
    } else {
      output = output.replace(/<base[^>]*href=["'][^"']*["'][^>]*>/i, `<base href="${normalizedBase}">`);
    }

    if (!/data-cloudops-static-host=["']true["']/i.test(output)) {
      const runtimeScript = this.getStaticHostRuntimeScript(apiBaseUrl);
      if (runtimeScript) {
        output = output.replace(/<head([^>]*)>/i, `<head$1>\n    ${runtimeScript}`);
      }
    }

    return output;
  }

  async listSourceFiles(dir, files = []) {
    const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoredDirs.has(entry.name)) continue;

      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.listSourceFiles(entryPath, files);
        continue;
      }

      if (/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }

    return files;
  }

  async prepareReactRouterForStaticHosting(projectPath, onLog = () => {}) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      if (!allDeps['react-router-dom']) {
        return;
      }

      const sourceFiles = await this.listSourceFiles(projectPath);
      let patchedFiles = 0;

      for (const filePath of sourceFiles) {
        const content = await fs.readFile(filePath, 'utf8');
        if (
          !content.includes('BrowserRouter')
          || content.includes('HashRouter')
          || !/from\s+['"]react-router-dom['"]/.test(content)
        ) {
          continue;
        }

        const updated = content.replace(/\bBrowserRouter\b/g, 'HashRouter');
        if (updated !== content) {
          await fs.writeFile(filePath, updated, 'utf8');
          patchedFiles += 1;
        }
      }

      if (patchedFiles > 0) {
        onLog(
          `Adjusted ${patchedFiles} React Router file${patchedFiles === 1 ? '' : 's'} for S3 subfolder hosting.`,
          'info'
        );
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        onLog(`React Router static-hosting preparation skipped: ${error.message}`, 'warn');
      }
    }
  }

  async prepareViteBuildScriptForStaticHosting(projectPath, onLog = () => {}) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const rawPackageJson = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(rawPackageJson.replace(/^\uFEFF/, ''));
      const buildScript = packageJson.scripts?.build;

      if (typeof buildScript !== 'string' || !/\bvite\s+build\b/.test(buildScript)) {
        return;
      }

      const viteOnlyScript = buildScript
        .replace(/^\s*tsc(?:\s+-b)?\s*&&\s*/i, '')
        .trim();

      if (viteOnlyScript === buildScript || !/^vite\s+build\b/.test(viteOnlyScript)) {
        return;
      }

      packageJson.scripts.build = viteOnlyScript;
      await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
      onLog(
        `Adjusted Vite build script for static hosting: "${buildScript}" -> "${viteOnlyScript}".`,
        'info'
      );
    } catch (error) {
      if (error.code !== 'ENOENT') {
        onLog(`Vite build script preparation skipped: ${error.message}`, 'warn');
      }
    }
  }

  async validateS3Deployment(bucket, prefix, onLog = () => {}) {
    const normalizedPrefix = prefix ? `${prefix.replace(/^\/+|\/+$/g, '')}/` : '';
    const requiredKeys = [`${normalizedPrefix}index.html`];

    const listResult = await this.s3Client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: normalizedPrefix,
      MaxKeys: 200,
    }));

    const keys = (listResult.Contents || []).map((item) => item.Key).filter(Boolean);
    if (keys.length === 0) {
      throw new Error(`S3 validation failed: no objects found under prefix "${normalizedPrefix}"`);
    }

    for (const requiredKey of requiredKeys) {
      if (!keys.includes(requiredKey)) {
        throw new Error(`S3 validation failed: missing required object "${requiredKey}"`);
      }
    }

    const assetKeys = keys.filter((key) => key.includes('/assets/'));
    if (assetKeys.length === 0) {
      onLog('Warning: no /assets/ directory found in deployment output.', 'warn');
    }

    const probeKeys = [
      ...requiredKeys,
      ...assetKeys.filter((key) => /\.(js|css|png|jpg|jpeg|svg|webp|ico)$/i.test(key)).slice(0, 6),
    ];

    for (const key of probeKeys) {
      try {
        const head = await this.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        if (!head.ContentType) {
          onLog(`Warning: missing Content-Type for ${key}`, 'warn');
        }
      } catch (error) {
        throw new Error(`S3 validation failed: unable to read "${key}" (${error.message})`);
      }
    }

    const indexHtml = await this.readS3ObjectAsText(bucket, `${normalizedPrefix}index.html`);
    const referencedAssetKeys = this.extractIndexAssetKeys(indexHtml, normalizedPrefix);
    for (const key of referencedAssetKeys) {
      if (!keys.includes(key)) {
        throw new Error(`S3 validation failed: index.html references missing asset "${key}"`);
      }
    }

    onLog('S3 deployment validation passed (index.html and assets reachable).', 'success');
  }

  async readS3ObjectAsText(bucket, key) {
    const result = await this.s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return result.Body.transformToString();
  }

  extractIndexAssetKeys(html, normalizedPrefix = '') {
    const refs = new Set();
    const prefixWithoutTrailingSlash = normalizedPrefix.replace(/\/$/, '');
    const attrPattern = /\b(?:src|href)=["']([^"']+)["']/gi;
    let match;

    while ((match = attrPattern.exec(html)) !== null) {
      const rawRef = match[1];
      if (!rawRef || /^(?:https?:)?\/\//i.test(rawRef) || rawRef.startsWith('data:') || rawRef.startsWith('#')) {
        continue;
      }

      const cleanRef = rawRef.split(/[?#]/)[0].replace(/^\/+/, '');
      if (!cleanRef || cleanRef === 'index.html') {
        continue;
      }

      if (normalizedPrefix && cleanRef.startsWith(normalizedPrefix)) {
        refs.add(cleanRef);
      } else if (prefixWithoutTrailingSlash && cleanRef.startsWith(`${prefixWithoutTrailingSlash}/`)) {
        refs.add(cleanRef);
      } else {
        refs.add(`${normalizedPrefix}${cleanRef}`);
      }
    }

    return [...refs].filter((key) => !key.endsWith('/'));
  }

  async detectPackageManager(projectPath) {
    const checks = [
      { file: 'pnpm-lock.yaml', cmd: 'pnpm', installArgs: ['install', '--frozen-lockfile', '--prod=false'] },
      { file: 'yarn.lock', cmd: 'yarn', installArgs: ['install', '--frozen-lockfile'] },
      { file: 'package-lock.json', cmd: 'npm', installArgs: ['ci', '--include=dev'] },
    ];

    for (const { file, cmd, installArgs } of checks) {
      try {
        await fs.access(path.join(projectPath, file));
        return { cmd, installArgs };
      } catch {
        // continue
      }
    }

    return { cmd: 'npm', installArgs: ['install', '--include=dev'] };
  }

  async resolveOutputDir(projectPath, outputDirectory) {
    const candidates = outputDirectory
      ? [outputDirectory]
      : ['dist', 'build', 'out', '.next/static', 'public'];

    for (const dir of candidates) {
      const fullPath = path.join(projectPath, dir);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) return { relative: dir, absolute: fullPath };
      } catch {
        // continue
      }
    }

    throw new Error(`Build output not found. Expected one of: ${candidates.join(', ')}`);
  }

  resolveBuildInvocation(buildCommand, packageManager) {
    const trimmed = (buildCommand || '').trim();

    if (/^(npm|yarn|pnpm)\s/.test(trimmed)) {
      const [cmd, ...args] = trimmed.split(/\s+/);
      return { cmd, args };
    }

    if (packageManager === 'yarn') {
      return { cmd: 'yarn', args: ['build'] };
    }
    if (packageManager === 'pnpm') {
      return { cmd: 'pnpm', args: ['run', 'build'] };
    }
    return { cmd: 'npm', args: ['run', 'build'] };
  }

  async buildProject({
    projectPath,
    buildCommand,
    environmentVariables = {},
    siteSlug = null,
    onLog = () => {},
  }) {
    const backendNode = await require('./frameworkDetector').isBackendNodeProject(projectPath);
    if (backendNode.isBackend) {
      throw new Error(
        'This repository is a Node.js backend API, not a static frontend. '
        + 'Use Backend API deployment (npm install + npm start) instead of S3 static hosting.'
      );
    }

    await this.prepareReactRouterForStaticHosting(projectPath, onLog);
    await this.prepareViteBuildScriptForStaticHosting(projectPath, onLog);

    const buildEnv = this.getBuildEnv(environmentVariables, siteSlug);
    if (siteSlug && buildEnv.VITE_BASE) {
      onLog(`Setting VITE_BASE=${buildEnv.VITE_BASE}`, 'info');
    }
    if (buildEnv.VITE_API_URL) {
      onLog(`Setting VITE_API_URL=${buildEnv.VITE_API_URL}`, 'info');
    }

    onLog('Detecting package manager...', 'system');
    const { cmd, installArgs } = await this.detectPackageManager(projectPath);

    onLog(`Installing dependencies (${cmd})...`, 'system');
    await this.runCommand(cmd, installArgs, projectPath, this.getInstallEnv(environmentVariables), (line, level) => {
      onLog(maskSecrets(line), level);
    });

    if (!buildCommand || buildCommand.includes('No build needed')) {
      onLog('No frontend build step required.', 'info');
      return;
    }

    const { cmd: buildCmd, args: buildArgs } = this.resolveBuildInvocation(buildCommand, cmd);
    const buildLabel = `${buildCmd} ${buildArgs.join(' ')}`;
    onLog(`Running build: ${buildLabel}`, 'system');
    await this.runCommand(buildCmd, buildArgs, projectPath, buildEnv, (line, level) => {
      onLog(maskSecrets(line), level);
    });

    onLog('Build completed successfully.', 'success');
  }

  getS3BucketName() {
    return process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || null;
  }

  getS3PublicUrl(bucket, prefix = '') {
    const host = this.s3Region === 'us-east-1'
      ? `${bucket}.s3.amazonaws.com`
      : `${bucket}.s3.${this.s3Region}.amazonaws.com`;
    const normalizedPrefix = prefix ? `${prefix.replace(/^\/+|\/+$/g, '')}/` : '';
    return `https://${host}/${normalizedPrefix}`;
  }

  getS3WebsiteUrl(bucket, prefix = '') {
    const normalizedPrefix = prefix ? `${prefix.replace(/^\/+|\/+$/g, '')}/` : '';
    const host = this.s3Region === 'us-east-1'
      ? `${bucket}.s3-website-us-east-1.amazonaws.com`
      : `${bucket}.s3-website-${this.s3Region}.amazonaws.com`;
    return `http://${host}/${normalizedPrefix}`;
  }

  async deployStaticToS3({ projectPath, outputDirectory, siteSlug, onLog = () => {}, skipAccessVerify = false }) {
    const bucket = this.getS3BucketName();
    if (!bucket) {
      throw new Error('S3_BUCKET_NAME or AWS_S3_BUCKET_NAME environment variable is required for S3 deployment.');
    }

    if (!skipAccessVerify) {
      onLog(`Verifying access to S3 bucket: ${bucket}...`, 'system');
      await this.verifyBucketAccess(bucket, onLog);
    }

    const { absolute: outputPath } = await this.resolveOutputDir(projectPath, outputDirectory);
    const prefix = siteSlug;

    onLog(`Resolved build output path: ${outputPath}`, 'info');
    try {
      const topEntries = await fs.readdir(outputPath);
      onLog(`Top-level files in output: ${topEntries.join(', ')}`, 'info');
    } catch (err) {
      onLog(`Failed to read output directory listing: ${err.message}`, 'error');
    }

    await this.uploadDirectoryToS3(outputPath, bucket, prefix, onLog);
    await this.validateS3Deployment(bucket, prefix, onLog);

    const restUrl = this.getS3PublicUrl(bucket, prefix);
    const websiteUrl = this.getS3WebsiteUrl(bucket, prefix);

    onLog(`S3 object URL prefix: ${restUrl}`, 'info');
    onLog(`S3 website URL (open this in browser): ${websiteUrl}`, 'info');

    return websiteUrl;
  }

  async uploadDirectoryToS3(dir, bucket, prefix, onLog = () => {}) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.uploadDirectoryToS3(srcPath, bucket, prefix ? `${prefix}/${entry.name}` : entry.name, onLog);
        continue;
      }

      const key = prefix ? `${prefix}/${entry.name}` : entry.name;
      const contentType = this.getContentType(srcPath);
      const body = await fs.readFile(srcPath);

      let uploadBody = body;
      try {
        if (entry.name && entry.name.toLowerCase() === 'index.html') {
          const text = body.toString('utf8');
          const basePath = prefix ? `/${prefix.replace(/^\/+|\/+$/g, '')}/` : '/';
          const basePrefix = basePath.replace(/\/$/, '');
          const normalizedPaths = text.replace(
            /\b(src|href)=("|')\/(?!\/)(?!api(?:\/|$))/g,
            `$1=$2${basePrefix}/`
          );
          const rewritten = this.sanitizeIndexHtml(normalizedPaths, basePath);
          if (rewritten !== text) {
            uploadBody = Buffer.from(rewritten, 'utf8');
            onLog(`Normalized index.html asset paths for base "${basePath}"`, 'info');
          }
        }
      } catch (err) {
        onLog(`Failed to rewrite index.html paths: ${err.message}`, 'error');
      }

      try {
        await this.s3Client.send(new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: uploadBody,
          ContentType: contentType,
        }));

        onLog(`Uploaded ${key} to S3`, 'info');
      } catch (error) {
        const awsMessage = error && error.message ? error.message : 'Unknown AWS error';
        const awsCode = error && error.name ? error.name : 'UnknownError';
        onLog(`S3 upload failed for ${key}: ${awsCode} - ${awsMessage}`, 'error');
        throw new Error(`S3 upload failed for ${key}: ${awsCode} - ${awsMessage}`);
      }
    }
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.txt': 'text/plain; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
      '.wasm': 'application/wasm',
      '.map': 'application/json; charset=utf-8',
      '.webmanifest': 'application/manifest+json',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };
    return map[ext] || 'application/octet-stream';
  }

  async resolvePublicIp(publicUrl) {
    try {
      const { hostname } = new URL(publicUrl);
      const result = await dns.lookup(hostname);
      return result && result.address ? result.address : null;
    } catch {
      return null;
    }
  }

  generateSiteSlug(repositoryName) {
    const hash = crypto.randomBytes(4).toString('hex');
    const safeName = repositoryName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `${safeName}-${hash}`;
  }
}

module.exports = new StaticBuildService();
