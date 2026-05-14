const crypto = require('crypto');
const fs = require('fs/promises');
const net = require('net');
const os = require('os');
const path = require('path');

const Deployment = require('../models/Deployment');
const Project = require('../models/Project');
const dockerService = require('./dockerService');
const dockerfileGenerator = require('./dockerfileGenerator');
const frameworkDetector = require('./frameworkDetector');
const gitService = require('./gitService');

class DeploymentEngineService {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.allocatedPorts = new Set();
    this.portStart = Number(process.env.DEPLOYMENT_PORT_START || 3001);
    this.portEnd = Number(process.env.DEPLOYMENT_PORT_END || 3999);
  }

  normalizeEnvironmentVariables(environmentVariables = {}) {
    if (Array.isArray(environmentVariables)) {
      return environmentVariables.reduce((accumulator, item) => {
        if (item && item.key) {
          accumulator[item.key] = item.value;
        }
        return accumulator;
      }, {});
    }

    if (typeof environmentVariables !== 'object' || environmentVariables === null) {
      return {};
    }

    return environmentVariables;
  }

  normalizeTarget(target = {}) {
    if (!target || typeof target !== 'object') {
      return { type: 'local' };
    }

    if (target.type === 'ssh' || target.host || target.user) {
      return {
        type: 'ssh',
        host: target.host || target.hostname,
        user: target.user || target.username,
        port: Number(target.port || 22),
        keyPath: target.keyPath || target.privateKeyPath || null,
        workspaceRoot: target.workspaceRoot || '/tmp/cloudops-deployments',
        publicHost: target.publicHost || target.domain || null,
        publicUrl: target.publicUrl || null,
      };
    }

    return { type: 'local' };
  }

  toDeploymentRoom(deployment) {
    return `deployment:${deployment._id.toString()}`;
  }

  emitLog(io, deployment, source, level, message, data = {}) {
    deployment.addLog(source, level, message, data);

    const room = this.toDeploymentRoom(deployment);
    const payload = {
      deploymentId: deployment._id.toString(),
      source,
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      status: deployment.status,
      phase: deployment.phase,
    };

    if (io && typeof io.to === 'function') {
      io.to(room).emit('deployment-log', payload);
      if (deployment.repositoryName) {
        io.to(deployment.repositoryName).emit('deployment-log', payload);
      }
    }
  }

  async saveDeployment(deployment) {
    await deployment.save();
    return deployment;
  }

  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(false));
      server.listen({ port, host: '127.0.0.1' }, () => {
        server.close(() => resolve(true));
      });
    });
  }

  async allocatePort() {
    for (let port = this.portStart; port <= this.portEnd; port += 1) {
      if (this.allocatedPorts.has(port)) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      if (await this.isPortAvailable(port)) {
        this.allocatedPorts.add(port);
        return port;
      }
    }

    throw new Error(`No free ports available in range ${this.portStart}-${this.portEnd}`);
  }

  releasePort(port) {
    if (typeof port === 'number') {
      this.allocatedPorts.delete(port);
    }
  }

  extractRepositoryName(repositoryUrl = '') {
    const cleaned = repositoryUrl.replace(/\.git$/, '');
    const parts = cleaned.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'application';
  }

  buildEnvironmentObject(environmentVariables = {}) {
    return this.normalizeEnvironmentVariables(environmentVariables);
  }

  buildNginxConfig({ hostPort, serverName = '_', routePrefix = '/' }) {
    return `server {
    listen 80;
    server_name ${serverName};

    location ${routePrefix} {
        proxy_pass http://127.0.0.1:${hostPort};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /health {
        proxy_pass http://127.0.0.1:${hostPort}/health;
    }
}
`;
  }

  async startDeployment(input, io = null) {
    const repositoryUrl = input.repositoryUrl;
    if (!repositoryUrl) {
      throw new Error('repositoryUrl is required');
    }

    const repositoryName = input.repositoryName || this.extractRepositoryName(repositoryUrl);
    const environmentVariables = this.normalizeEnvironmentVariables(input.environmentVariables);
    const target = this.normalizeTarget(input.target || input.ec2Target || input.remoteTarget);
    const branch = input.branch || 'main';
    const projectId = input.projectId ? String(input.projectId) : null;
    const userId = input.userId != null ? String(input.userId) : null;
    const triggeredBy = input.triggeredBy || 'manual';
    const webhookId = input.webhookId || null;

    const deployment = new Deployment({
      projectId: projectId || undefined,
      userId: userId || String(input.userId || 'anonymous'),
      repositoryUrl,
      repositoryName,
      branch,
      environmentVariables: Object.entries(environmentVariables).map(([key, value]) => ({
        key,
        value: String(value),
        encrypted: false,
      })),
      status: 'queued',
      phase: 'queued',
      triggeredBy,
      webhookId,
      startedAt: new Date(),
      metadata: {
        target,
        queueState: 'queued',
      },
    });

    await deployment.save();
    this.emitLog(io, deployment, 'system', 'info', 'Deployment queued', {
      repositoryName,
      repositoryUrl,
      branch,
      target: target.type,
    });
    await deployment.save();

    this.queue.push({ deploymentId: deployment._id.toString(), io });
    this.processQueue().catch((error) => {
      console.error('Deployment queue processing failed:', error);
    });

    return {
      success: true,
      deploymentId: deployment._id.toString(),
      status: deployment.status,
      queueLength: this.queue.length,
    };
  }

  async processQueue() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      // eslint-disable-next-line no-await-in-loop
      await this.runDeployment(job.deploymentId, job.io);
    }

    this.processing = false;
  }

  buildContainerLabels(deployment, hostPort, containerPort) {
    return {
      'cloudops.deployment-id': deployment._id.toString(),
      'cloudops.project-id': deployment.projectId ? deployment.projectId.toString() : '',
      'cloudops.repository': deployment.repositoryName || this.extractRepositoryName(deployment.repositoryUrl),
      'cloudops.host-port': String(hostPort),
      'cloudops.container-port': String(containerPort),
    };
  }

  async cloneAndPrepare(deployment, buildDir, io) {
    deployment.updateStatus('cloning', 'clone');
    await this.saveDeployment(deployment);
    this.emitLog(io, deployment, 'git', 'info', 'Cloning repository', {
      repositoryUrl: deployment.repositoryUrl,
      branch: deployment.branch,
    });

    await gitService.cloneRepository(deployment.repositoryUrl, buildDir, {
      branch: deployment.branch,
      depth: 1,
      maxRetries: 3,
    });

    this.emitLog(io, deployment, 'git', 'info', 'Repository cloned', { buildDir });

    const repoInfo = await gitService.getRepositoryInfo(buildDir);
    deployment.commitHash = repoInfo.latestCommit.hash;
    deployment.commitShortHash = repoInfo.latestCommit.shortHash;
    deployment.commitMessage = repoInfo.latestCommit.message;
    deployment.commitAuthor = repoInfo.latestCommit.author;
    deployment.commitDate = repoInfo.latestCommit.date;
    deployment.branch = repoInfo.currentBranch || deployment.branch;

    const repoSize = await gitService.getRepositorySize(buildDir);
    deployment.metadata = deployment.metadata || {};
    deployment.metadata.repositorySize = repoSize;
    deployment.metadata.repositoryInfo = repoInfo;

    await this.saveDeployment(deployment);
  }

  async detectAndGenerate(deployment, buildDir, io) {
    deployment.updateStatus('detecting', 'framework_detection');
    await this.saveDeployment(deployment);
    this.emitLog(io, deployment, 'framework', 'info', 'Detecting framework');

    const detected = await frameworkDetector.detectFramework(buildDir);
    deployment.framework = detected.framework;
    deployment.frameworkVersion = detected.version;
    deployment.frameworkDetails = detected.details;

    this.emitLog(io, deployment, 'framework', 'info', `Detected ${detected.framework}`, {
      version: detected.version,
      port: detected.port,
      buildCommand: detected.buildCommand,
      confidence: detected.confidence,
    });

    deployment.updateStatus('building', 'dockerfile_generation');
    await this.saveDeployment(deployment);
    this.emitLog(io, deployment, 'docker', 'info', 'Generating Dockerfile', {
      framework: deployment.framework,
    });

    const dockerfileContent = dockerfileGenerator.generateDockerfile(deployment.framework, {
      port: detected.port || 3000,
      buildCommand: detected.buildCommand,
      startCommand: detected.startCommand,
      envVars: this.buildEnvironmentObject(deployment.environmentVariables),
    });

    deployment.dockerfile = dockerfileContent;
    const dockerfilePath = path.join(buildDir, 'Dockerfile');
    const dockerignorePath = path.join(buildDir, '.dockerignore');

    await dockerfileGenerator.saveDockerfile(dockerfileContent, dockerfilePath);
    await dockerfileGenerator.saveDockerigno(dockerignorePath);

    deployment.metadata = deployment.metadata || {};
    deployment.metadata.dockerfilePath = dockerfilePath;
    deployment.metadata.dockerignorePath = dockerignorePath;
    deployment.metadata.containerPort = detected.port || 3000;
    deployment.metadata.framework = detected.framework;
    deployment.metadata.frameworkVersion = detected.version;
    deployment.metadata.buildCommand = detected.buildCommand;
    deployment.metadata.startCommand = detected.startCommand;

    await this.saveDeployment(deployment);

    return {
      detected,
      containerPort: detected.port || 3000,
      dockerfileContent,
      dockerfilePath,
      dockerignorePath,
    };
  }

  async prepareRemoteWorkspace(deployment, buildDir, target) {
    const remoteParent = target.workspaceRoot || '/tmp/cloudops-deployments';
    const remoteWorkspace = `${remoteParent}/${path.basename(buildDir)}`;

    await dockerService.runRemoteCommand(target, `mkdir -p ${this.shellQuote(remoteParent)} && rm -rf ${this.shellQuote(remoteWorkspace)} && mkdir -p ${this.shellQuote(remoteWorkspace)}`);
    await dockerService.copyToRemote(target, buildDir, remoteParent);

    return { remoteParent, remoteWorkspace };
  }

  shellQuote(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
  }

  async configureNginx(deployment, hostPort, target, io) {
    const nginxConfig = this.buildNginxConfig({
      hostPort,
      serverName: target.publicHost || '_',
    });

    deployment.metadata = deployment.metadata || {};
    deployment.metadata.nginxConfig = nginxConfig;

    if (target.type === 'ssh') {
      const tempRemotePath = `/tmp/cloudops-${deployment._id}.conf`;
      const remoteConfigPath = `/etc/nginx/conf.d/cloudops-${deployment._id}.conf`;
      const localTempConfig = path.join(os.tmpdir(), `cloudops-nginx-${deployment._id}.conf`);

      await fs.writeFile(localTempConfig, nginxConfig, 'utf8');
      await dockerService.copyFileToRemote(target, localTempConfig, tempRemotePath);
      await dockerService.runRemoteCommand(
        target,
        `sudo mv ${this.shellQuote(tempRemotePath)} ${this.shellQuote(remoteConfigPath)} && sudo nginx -t && (sudo systemctl reload nginx || sudo nginx -s reload)`
      );

      deployment.metadata.nginxConfigPath = remoteConfigPath;
      this.emitLog(io, deployment, 'system', 'info', 'NGINX configured on remote host', {
        nginxConfigPath: remoteConfigPath,
      });

      await fs.rm(localTempConfig, { force: true }).catch(() => {});
      return remoteConfigPath;
    }

    const localConfigPath = path.join(buildDirFromDeployment(deployment), 'nginx.conf');
    await fs.writeFile(localConfigPath, nginxConfig, 'utf8');
    deployment.metadata.nginxConfigPath = localConfigPath;
    this.emitLog(io, deployment, 'system', 'info', 'NGINX config generated', {
      nginxConfigPath: localConfigPath,
    });
    return localConfigPath;
  }

  async runDeployment(deploymentId, io = null) {
    let deployment = null;
    let buildDir = null;
    let hostPort = null;

    try {
      deployment = await Deployment.findById(deploymentId);
      if (!deployment) {
        throw new Error('Deployment not found');
      }

      const startedAt = Date.now();
      buildDir = path.join(os.tmpdir(), `cloudops-${deploymentId}`);
      await fs.mkdir(buildDir, { recursive: true });

      const target = this.normalizeTarget(deployment.metadata?.target || {});

      await this.cloneAndPrepare(deployment, buildDir, io);
      const prepResult = await this.detectAndGenerate(deployment, buildDir, io);
      const containerPort = prepResult.containerPort;
      hostPort = await this.allocatePort();
      const imageName = `cloudops-${deploymentId}`.toLowerCase();
      const containerName = `cloudops-${deploymentId}`.toLowerCase();

      deployment.updateStatus('building', 'docker_build');
      await this.saveDeployment(deployment);
      this.emitLog(io, deployment, 'docker', 'info', 'Building Docker image', {
        imageName,
        contextPath: buildDir,
      });

      let buildContext = buildDir;
      let remoteWorkspace = null;

      if (target.type === 'ssh') {
        const remote = await this.prepareRemoteWorkspace(deployment, buildDir, target);
        buildContext = remote.remoteWorkspace;
        remoteWorkspace = remote.remoteWorkspace;
        deployment.metadata.remoteWorkspace = remoteWorkspace;
        deployment.metadata.target = target;
        await this.saveDeployment(deployment);
      }

      await dockerService.buildImage({
        imageName,
        contextPath: buildContext,
        dockerfilePath: path.join(buildContext, 'Dockerfile'),
        target: target.type === 'ssh' ? { ...target, remoteWorkspace: buildContext } : null,
        onStdout: (chunk) => this.emitLog(io, deployment, 'docker', 'debug', chunk.trim(), {}),
        onStderr: (chunk) => this.emitLog(io, deployment, 'docker', 'warn', chunk.trim(), {}),
      });

      deployment.updateStatus('deploying', 'container_start');
      await this.saveDeployment(deployment);
      this.emitLog(io, deployment, 'docker', 'info', 'Starting container', {
        hostPort,
        containerPort,
        containerName,
      });

      const environmentObject = this.buildEnvironmentObject(deployment.environmentVariables);
      const labels = this.buildContainerLabels(deployment, hostPort, containerPort);

      const runResult = await dockerService.runContainer({
        imageName,
        containerName,
        hostPort,
        containerPort,
        env: environmentObject,
        target: target.type === 'ssh' ? target : null,
        labels,
        onStdout: (chunk) => this.emitLog(io, deployment, 'docker', 'debug', chunk.trim(), {}),
        onStderr: (chunk) => this.emitLog(io, deployment, 'docker', 'warn', chunk.trim(), {}),
      });

      const liveUrl = target.type === 'ssh'
        ? (target.publicUrl || `http://${target.publicHost || target.host}`)
        : `http://localhost:${hostPort}`;

      deployment.metadata = deployment.metadata || {};
      deployment.metadata.imageName = imageName;
      deployment.metadata.containerName = containerName;
      deployment.metadata.hostPort = hostPort;
      deployment.metadata.containerPort = containerPort;
      deployment.metadata.liveUrl = liveUrl;
      deployment.metadata.runResult = runResult;
      deployment.metadata.target = target;
      deployment.metadata.queueState = 'completed';
      deployment.publicUrl = liveUrl;
      deployment.totalTime = Date.now() - startedAt;
      deployment.deployTime = deployment.totalTime;
      deployment.buildTime = Math.max(1, deployment.totalTime - 5000);
      deployment.updateStatus('running', 'nginx_setup');
      await this.saveDeployment(deployment);

      await this.configureNginx(deployment, hostPort, target, io);

      deployment.updateStatus('success', 'complete');
      deployment.markAsSuccess(liveUrl, Date.now() - startedAt);
      deployment.metadata = deployment.metadata || {};
      deployment.metadata.deployState = 'running';
      deployment.metadata.completedAt = new Date().toISOString();
      deployment.metadata.containerStatus = 'running';
      await this.saveDeployment(deployment);

      this.emitLog(io, deployment, 'system', 'success', 'Deployment completed successfully', {
        liveUrl,
        imageName,
        containerName,
        hostPort,
        containerPort,
      });

      return {
        success: true,
        deploymentId: deployment._id.toString(),
        status: deployment.status,
        phase: deployment.phase,
        liveUrl,
        imageName,
        containerName,
        hostPort,
        containerPort,
      };
    } catch (error) {
      if (deployment) {
        deployment.updateStatus('failed', 'cleanup');
        deployment.markAsFailed(error, deployment.phase);
        deployment.metadata = deployment.metadata || {};
        deployment.metadata.queueState = 'failed';
        deployment.metadata.failureAt = new Date().toISOString();
        await deployment.save().catch(() => {});
        this.emitLog(io, deployment, 'system', 'error', 'Deployment failed', {
          error: error.message,
        });
      }

      await this.cleanupFailedDeployment({
        deployment,
        buildDir,
        hostPort,
        io,
      });

      throw error;
    } finally {
      if (hostPort !== null) {
        this.releasePort(hostPort);
      }

      if (buildDir) {
        await fs.rm(buildDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  }

  async cleanupFailedDeployment({ deployment, buildDir, hostPort, io }) {
    if (!deployment) {
      return;
    }

    const metadata = deployment.metadata || {};
    const target = this.normalizeTarget(metadata.target || {});
    const containerName = metadata.containerName;
    const imageName = metadata.imageName;

    if (containerName) {
      await dockerService.removeContainer(containerName, target.type === 'ssh' ? target : null).catch(() => {});
    }

    if (imageName) {
      await dockerService.removeImage(imageName, target.type === 'ssh' ? target : null).catch(() => {});
    }

    if (buildDir) {
      await fs.rm(buildDir, { recursive: true, force: true }).catch(() => {});
    }

    if (hostPort) {
      this.releasePort(hostPort);
    }

    this.emitLog(io, deployment, 'system', 'warn', 'Failed deployment cleaned up', {
      containerName,
      imageName,
      hostPort,
    });
  }

  async getDeploymentDetails(deploymentId) {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    return {
      deploymentId: deployment._id.toString(),
      projectId: deployment.projectId ? deployment.projectId.toString() : null,
      userId: deployment.userId,
      repositoryUrl: deployment.repositoryUrl,
      repositoryName: deployment.repositoryName,
      branch: deployment.branch,
      status: deployment.status,
      phase: deployment.phase,
      framework: deployment.framework,
      publicUrl: deployment.publicUrl,
      logs: deployment.logs.slice(-100),
      metadata: deployment.metadata || {},
      error: deployment.error,
      startedAt: deployment.startedAt,
      completedAt: deployment.completedAt,
      totalTime: deployment.totalTime,
    };
  }

  async listDeployments(filter = {}) {
    const query = {};

    if (filter.projectId) {
      query.projectId = filter.projectId;
    }

    if (filter.userId) {
      query.userId = String(filter.userId);
    }

    if (filter.status) {
      query.status = filter.status;
    }

    return Deployment.find(query).sort({ createdAt: -1 });
  }

  async getDeploymentLogs(deploymentId, options = {}) {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const { source = null, level = null, limit = 100, skip = 0 } = options;
    let logs = [...deployment.logs];

    if (source) {
      logs = logs.filter((log) => log.source === source);
    }

    if (level) {
      logs = logs.filter((log) => log.level === level);
    }

    logs.sort((a, b) => b.timestamp - a.timestamp);
    return logs.slice(skip, skip + limit);
  }

  async stopDeployment(deploymentId, io = null) {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const metadata = deployment.metadata || {};
    const target = this.normalizeTarget(metadata.target || {});
    const containerName = metadata.containerName;

    if (!containerName) {
      throw new Error('Container name not found for deployment');
    }

    await dockerService.stopContainer(containerName, target.type === 'ssh' ? target : null);
    deployment.updateStatus('stopped', 'cleanup');
    deployment.metadata = deployment.metadata || {};
    deployment.metadata.containerStatus = 'stopped';
    await deployment.save();

    this.emitLog(io, deployment, 'docker', 'info', 'Container stopped', { containerName });

    return { success: true, status: 'stopped', containerName };
  }

  async restartDeployment(deploymentId, io = null) {
    const deployment = await Deployment.findById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const metadata = deployment.metadata || {};
    const target = this.normalizeTarget(metadata.target || {});
    const containerName = metadata.containerName;
    const imageName = metadata.imageName;
    const hostPort = metadata.hostPort;
    const containerPort = metadata.containerPort || 3000;
    const env = this.buildEnvironmentObject(deployment.environmentVariables);
    const labels = this.buildContainerLabels(deployment, hostPort, containerPort);

    if (!containerName || !imageName || !hostPort) {
      throw new Error('Deployment is missing restart metadata');
    }

    try {
      await dockerService.restartContainer(containerName, target.type === 'ssh' ? target : null);
    } catch (error) {
      await dockerService.runContainer({
        imageName,
        containerName,
        hostPort,
        containerPort,
        env,
        target: target.type === 'ssh' ? target : null,
        labels,
      });
    }

    deployment.updateStatus('running', 'container_start');
    deployment.metadata = deployment.metadata || {};
    deployment.metadata.containerStatus = 'running';
    await deployment.save();

    this.emitLog(io, deployment, 'docker', 'info', 'Container restarted', { containerName });

    return { success: true, status: 'running', containerName };
  }

  async handleWebhook(payload, io = null, requestContext = {}) {
    const repository = payload?.repository || {};
    const fullName = repository.full_name || '';
    const cloneUrl = repository.clone_url || repository.ssh_url || '';

    const project = await Project.findOne({
      $or: [
        { repositoryUrl: cloneUrl },
        fullName ? { repositoryName: repository.name, repositoryOwner: repository.owner?.login } : null,
      ].filter(Boolean),
    });

    if (!project) {
      throw new Error('No matching project found for webhook');
    }

    const latestDeployment = await Deployment.findOne({ projectId: project._id }).sort({ createdAt: -1 });
    const target = this.normalizeTarget(latestDeployment?.metadata?.target || {});
    const branch = payload?.ref ? payload.ref.replace('refs/heads/', '') : (repository.default_branch || 'main');

    return this.startDeployment({
      projectId: project._id,
      userId: project.userId,
      repositoryUrl: project.repositoryUrl,
      repositoryName: project.repositoryName,
      branch,
      environmentVariables: latestDeployment?.environmentVariables || [],
      target,
      triggeredBy: 'webhook',
      webhookId: project.githubWebhookId,
    }, io);
  }

  verifyWebhookSignature(rawBody, secret, signatureHeader) {
    if (!secret || !signatureHeader || !rawBody) {
      return false;
    }

    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody));
    const expected = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');
    const received = String(signatureHeader).replace(/^sha256=/, '');

    if (expected.length !== received.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
  }
}

function buildDirFromDeployment(deployment) {
  return path.join(os.tmpdir(), `cloudops-${deployment._id.toString()}`);
}

module.exports = new DeploymentEngineService();
