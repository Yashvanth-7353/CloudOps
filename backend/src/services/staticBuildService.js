/**
 * Static Build Service
 * Builds frontend projects and deploys dist output to S3 — no Docker/ECS required.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const dns = require('dns').promises;
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

  getBuildEnv(environmentVariables = {}) {
    return { ...environmentVariables };
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

  async buildProject({ projectPath, buildCommand, environmentVariables = {}, onLog = () => {} }) {
    onLog('Detecting package manager...', 'system');
    const { cmd, installArgs } = await this.detectPackageManager(projectPath);

    onLog(`Installing dependencies (${cmd})...`, 'system');
    await this.runCommand(cmd, installArgs, projectPath, this.getInstallEnv(environmentVariables), onLog);

    const { cmd: buildCmd, args: buildArgs } = this.resolveBuildInvocation(buildCommand, cmd);
    const buildLabel = `${buildCmd} ${buildArgs.join(' ')}`;
    onLog(`Running build: ${buildLabel}`, 'system');
    await this.runCommand(buildCmd, buildArgs, projectPath, this.getBuildEnv(environmentVariables), onLog);

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
          const rewritten = text.replace(/(src|href)=("|')\/+/g, '$1=$2./');
          if (rewritten !== text) {
            uploadBody = Buffer.from(rewritten, 'utf8');
            onLog(`Rewrote absolute paths in ${key} to relative paths`, 'info');
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
