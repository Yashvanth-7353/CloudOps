/**
 * Azure Deployment Service
 * Handles ACR image build/push and ACI container deployment
 */

const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const Deployment = require('../models/Deployment');

const TEMP_ROOT = path.resolve(__dirname, '../../temp/azure');
const DEFAULT_CONTAINER_PORT = 3000;

// Azure settings — read from env at call time so .env is loaded first
function azureConfig() {
  return {
    acrLoginServer: process.env.ACR_LOGIN_SERVER,
    acrUsername: process.env.ACR_USERNAME,
    acrPassword: process.env.ACR_PASSWORD,
    resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'cloud-ops-sea',
    location: process.env.AZURE_LOCATION || 'southeastasia',
    blobContainer: process.env.AZURE_BLOB_CONTAINER || 'cloudops-artifacts',
    prefixBase: process.env.AZURE_PREFIX_BASE || 'deployments',
    // Path to the azure_orchestrator Python package — resolve from backend/ root
    orchestratorCwd: path.resolve(
      __dirname,  // backend/src/services
      '..', '..', // -> backend/
      '..', 'azure', 'azure_orchestrator'  // -> CloudOps/azure/azure_orchestrator
    ),
    python: process.env.PYTHON || 'python',
  };
}

function runCommand(command, args, options = {}, onData) {
  return new Promise((resolve, reject) => {
    // Always merge with full parent env so PATH/COMSPEC/SystemRoot are never lost
    const mergedEnv = { ...process.env, ...(options.env || {}) };
    const { env: _e, ...restOpts } = options;

    // Spawn directly without shell — works cross-platform and avoids cmd.exe lookup issues
    const child = spawn(command, args, { ...restOpts, env: mergedEnv, shell: false });
    let output = '';

    child.on('error', (err) => reject(err));
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      if (onData) onData(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      if (onData) onData(text);
    });
    child.on('close', (code) => {
      if (code === 0) return resolve(output);
      reject(new Error(`${command} exited with code ${code}\n${output}`));
    });
  });
}

async function safeRemove(targetPath) {
  if (!existsSync(targetPath)) return;
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function findNodeAppRelativePath(repoPath) {
  if (existsSync(path.join(repoPath, 'package.json'))) return '.';
  async function walk(currentPath, depth, baseRelative) {
    if (depth > 4) return null;
    let entries = [];
    try { entries = await fs.readdir(currentPath, { withFileTypes: true }); } catch { return null; }
    if (entries.some((e) => e.isFile() && e.name === 'package.json')) return baseRelative || '.';
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.git' || entry.name === 'node_modules') continue;
      const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
      const found = await walk(path.join(currentPath, entry.name), depth + 1, rel);
      if (found) return found;
    }
    return null;
  }
  return walk(repoPath, 0, '');
}

async function findFirstMatchingDir(repoPath, matcher) {
  async function walk(currentPath, depth, baseRelative) {
    if (depth > 4) return null;
    let entries = [];
    try { entries = await fs.readdir(currentPath, { withFileTypes: true }); } catch { return null; }
    if (matcher(entries)) return baseRelative || '.';
    for (const entry of entries) {
      if (!entry.isDirectory() || ['git', 'node_modules', '__pycache__'].includes(entry.name)) continue;
      const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
      const found = await walk(path.join(currentPath, entry.name), depth + 1, rel);
      if (found) return found;
    }
    return null;
  }
  return walk(repoPath, 0, '');
}

async function detectFramework(repoPath) {
  const nodePath = await findNodeAppRelativePath(repoPath);
  if (nodePath) return { framework: 'node', appRelativePath: nodePath };

  const pythonPath = await findFirstMatchingDir(repoPath, (entries) =>
    entries.some((e) => e.isFile() && (e.name === 'requirements.txt' || e.name.toLowerCase().endsWith('.py')))
  );
  if (pythonPath) return { framework: 'python', appRelativePath: pythonPath };

  const htmlPath = await findFirstMatchingDir(repoPath, (entries) =>
    entries.some((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
  );
  if (htmlPath) return { framework: 'static', appRelativePath: htmlPath };

  return { framework: 'generic', appRelativePath: '.' };
}

async function ensureDockerfile(repoPath) {
  const dockerfilePath = path.join(repoPath, 'Dockerfile');
  if (existsSync(dockerfilePath)) return { framework: 'custom', appRelativePath: '.', containerPort: DEFAULT_CONTAINER_PORT };

  const detection = await detectFramework(repoPath);
  const { appRelativePath } = detection;
  const cp = appRelativePath === '.' ? '' : `${appRelativePath}/`;

  const templates = {
    node: `FROM node:20-alpine\nWORKDIR /app\nCOPY ${cp}package*.json ./\nRUN npm install\nCOPY ${cp}. .\nEXPOSE ${DEFAULT_CONTAINER_PORT}\nCMD ["npm", "start"]\n`,
    python: `FROM python:3.12-alpine\nENV PYTHONUNBUFFERED=1\nWORKDIR /app\nCOPY ${cp}. .\nRUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi\nCMD ["sh", "-c", "if [ -f app.py ]; then python app.py; elif [ -f main.py ]; then python main.py; else exit 1; fi"]\n`,
    static: `FROM nginx:alpine\nCOPY ${cp}. /usr/share/nginx/html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]\n`,
    generic: `FROM alpine:3.20\nWORKDIR /workspace\nCOPY . .\nCMD ["sh", "-c", "echo 'No runnable framework detected'; exit 1"]\n`,
  };

  const content = templates[detection.framework] || templates.generic;
  await fs.writeFile(dockerfilePath, content, 'utf8');
  return { framework: detection.framework, appRelativePath, containerPort: detection.framework === 'static' ? 80 : DEFAULT_CONTAINER_PORT };
}

async function runAciViaPython({ deploymentId, appName, image, socketId, logLines, io, deployment }) {
  const cfg = azureConfig();
  const groupName = `cg-${appName}-${deploymentId}`.slice(0, 63);
  const logsBlobName = `${cfg.prefixBase}/${deploymentId}/aci.log.txt`;

  const env = {
    ...process.env,
    AZURE_RESOURCE_GROUP: cfg.resourceGroup,
    AZURE_LOCATION: cfg.location,
    ACI_IMAGE: image,
    ACI_CONTAINER_GROUP_NAME: groupName,
    ACI_CONTAINER_NAME: 'task',
    ACI_CPU: process.env.ACI_CPU || '1',
    ACI_MEMORY_GB: process.env.ACI_MEMORY_GB || '1.5',
    AZURE_LOGS_CONTAINER: cfg.blobContainer,
    AZURE_LOGS_BLOB_NAME: logsBlobName,
  };

  let publicIp = '';
  let fqdn = '';

  emitLog(io, socketId, `[Azure] Starting ACI container in ${cfg.resourceGroup}/${cfg.location}...`);
  if (deployment) deployment.addLog('aci', 'info', `Starting ACI container in ${cfg.resourceGroup}/${cfg.location}...`, {}, 'azure');

  await runCommand(cfg.python, ['-m', 'azure_orchestrator.aci_main'], { cwd: cfg.orchestratorCwd, env }, (line) => {
    const msg = line.trimEnd();
    if (!msg) return;
    emitLog(io, socketId, msg);
    if (deployment) deployment.addLog('aci', 'info', msg, {}, 'azure');
    logLines.push(msg);
    const ipMatch = msg.match(/public IP:\s+(\S+)/);
    if (ipMatch) publicIp = ipMatch[1];
    const fqdnMatch = msg.match(/FQDN:\s+(\S+)/);
    if (fqdnMatch) fqdn = fqdnMatch[1];
  });

  return {
    containerGroup: groupName,
    containerName: 'task',
    publicIp,
    fqdn,
    accessUrl: fqdn ? `http://${fqdn}` : publicIp ? `http://${publicIp}:80` : null,
  };
}

async function uploadArtifacts({ deploymentId, summaryPath, logsPath }) {
  const cfg = azureConfig();
  const prefix = `${cfg.prefixBase}/${deploymentId}`;
  await runCommand(
    cfg.python,
    ['-m', 'azure_orchestrator.cli_upload', '--container', cfg.blobContainer, '--prefix', prefix, '--summary-json', summaryPath, '--logs-json', logsPath],
    { cwd: cfg.orchestratorCwd },
    () => {}
  );
}

function emitLog(io, socketId, message) {
  console.log(message);
  if (socketId && io) io.to(socketId).emit('deploy:log', message);
}

/**
 * Main entry point — called from the route handler
 * Responds 202 immediately, then runs the pipeline async
 */
async function runAzureDeployment({ repoUrl, appName, socketId, io, userId }) {
  const cfg = azureConfig();
  if (!cfg.acrLoginServer) throw new Error('ACR_LOGIN_SERVER is not configured in backend .env');

  const deploymentId = uuidv4().slice(0, 8);
  const sanitizedName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const cloneDir = path.resolve(TEMP_ROOT, `${sanitizedName}-${deploymentId}`);
  const artifactsDir = `${cloneDir}-artifacts`;
  const summaryPath = path.join(artifactsDir, 'summary.json');
  const logsPath = path.join(artifactsDir, 'logs.json');
  const logLines = [];
  const git = simpleGit();

  // Create deployment record
  let deployment = null;
  try {
    deployment = new Deployment({
      userId: userId || 'anonymous',
      repositoryUrl: repoUrl,
      repositoryName: sanitizedName,
      deploymentService: 'azure',
      status: 'pending',
      phase: 'preparation',
      infrastructure: {
        provider: 'azure',
        targetType: 'azure',
        region: cfg.location,
        acr: {
          loginServer: cfg.acrLoginServer,
          repositoryName: sanitizedName,
        },
        aci: {
          resourceGroupName: cfg.resourceGroup,
          location: cfg.location,
        },
      },
    });
    await deployment.save();
  } catch (dbErr) {
    console.error('[Azure] Failed to create deployment record:', dbErr);
  }

  try {
    emitLog(io, socketId, `[Azure] Starting deployment ${deploymentId}`);
    if (deployment) deployment.addLog('system', 'info', `Deployment started: ${deploymentId}`, {}, 'azure');

    emitLog(io, socketId, `[Azure] Cloning ${repoUrl}`);
    if (deployment) deployment.addLog('system', 'info', `Cloning repository: ${repoUrl}`, {}, 'azure');

    await safeRemove(cloneDir);
    await safeRemove(artifactsDir);
    await fs.mkdir(cloneDir, { recursive: true });
    await fs.mkdir(artifactsDir, { recursive: true });

    await git.clone(repoUrl, cloneDir);
    emitLog(io, socketId, '[Azure] Repository cloned.');
    if (deployment) deployment.addLog('git', 'success', 'Repository cloned successfully', { repoUrl }, 'azure');
    logLines.push(`[Azure] Cloned ${repoUrl}`);

    const buildPlan = await ensureDockerfile(cloneDir);
    emitLog(io, socketId, `[Azure] Dockerfile ready. Framework: ${buildPlan.framework}`);
    if (deployment) {
      deployment.framework = buildPlan.framework;
      deployment.frameworkVersion = buildPlan.frameworkVersion;
      deployment.addLog('framework', 'info', `Framework detected: ${buildPlan.framework}`, buildPlan, 'azure');
    }
    logLines.push(`[Azure] Framework: ${buildPlan.framework}`);

    const fullImage = `${cfg.acrLoginServer}/${sanitizedName}:${deploymentId}`;
    emitLog(io, socketId, `[Azure] Building image ${fullImage}...`);
    if (deployment) deployment.addLog('docker', 'info', `Starting Docker build: ${fullImage}`, {}, 'azure');

    await runCommand('docker', ['build', '-t', fullImage, '.'], { cwd: cloneDir }, (line) => {
      emitLog(io, socketId, line);
      logLines.push(line);
    });

    if (deployment) {
      deployment.infrastructure.acr.imageUri = fullImage;
      deployment.infrastructure.acr.imageTag = deploymentId;
      deployment.infrastructure.acr.imageName = sanitizedName;
      deployment.addLog('docker', 'success', 'Docker image built successfully', { imageUri: fullImage }, 'azure');
    }

    if (cfg.acrUsername && cfg.acrPassword) {
      emitLog(io, socketId, '[Azure] Logging into ACR...');
      if (deployment) deployment.addLog('acr', 'info', 'Authenticating with Azure Container Registry', {}, 'azure');
      
      await runCommand('docker', ['login', cfg.acrLoginServer, '-u', cfg.acrUsername, '-p', cfg.acrPassword], {}, (line) => {
        emitLog(io, socketId, line);
        logLines.push(line);
      });
    }

    emitLog(io, socketId, '[Azure] Pushing image to ACR...');
    if (deployment) deployment.addLog('acr', 'info', 'Pushing image to Azure Container Registry', {}, 'azure');

    await runCommand('docker', ['push', fullImage], {}, (line) => {
      emitLog(io, socketId, line);
      logLines.push(line);
    });

    if (deployment) deployment.addLog('acr', 'success', 'Image pushed to ACR successfully', { imageUri: fullImage }, 'azure');

    const aciResult = await runAciViaPython({ deploymentId, appName: sanitizedName, image: fullImage, socketId, logLines, io, deployment });

    const appUrl = aciResult.accessUrl || `http://${aciResult.publicIp}`;
    emitLog(io, socketId, `[Azure] Container running at: ${appUrl}`);

    if (deployment) {
      deployment.infrastructure.aci.containerGroupName = aciResult.containerGroup;
      deployment.infrastructure.aci.containerName = aciResult.containerName;
      deployment.infrastructure.aci.fqdn = aciResult.fqdn;
      deployment.infrastructure.aci.ipAddress = aciResult.publicIp;
      deployment.infrastructure.aci.status = 'running';
      deployment.infrastructure.liveUrl = appUrl;
      deployment.publicUrl = appUrl;
      deployment.status = 'success';
      deployment.phase = 'complete';
      deployment.completedAt = new Date();
      deployment.addLog('aci', 'success', `Container running at: ${appUrl}`, { url: appUrl }, 'azure');
    }

    const summary = {
      deploymentId, appName: sanitizedName, repoUrl,
      imageTag: fullImage, containerName: aciResult.containerGroup,
      appUrl, containerIp: aciResult.publicIp, containerFqdn: aciResult.fqdn,
      finishedAt: new Date().toISOString(), status: 'success',
      resourceGroup: cfg.resourceGroup, location: cfg.location,
    };

    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
    await fs.writeFile(logsPath, JSON.stringify({ deploymentId, logs: logLines }, null, 2) + '\n', 'utf8');

    emitLog(io, socketId, '[Azure] Uploading artifacts to Azure Blob...');
    if (deployment) deployment.addLog('system', 'info', 'Uploading deployment artifacts', {}, 'azure');

    await uploadArtifacts({ deploymentId, summaryPath, logsPath });

    emitLog(io, socketId, `[Azure] Deployment complete! App URL: ${appUrl}`);
    if (deployment) {
      await deployment.save();
    }

    if (io && socketId) {
      io.to(socketId).emit('deploy:done', { 
        deploymentId: deployment?._id?.toString() || deploymentId, 
        url: appUrl 
      });
    }
  } catch (error) {
    const msg = error?.message || String(error);
    emitLog(io, socketId, `[Azure] Deployment failed: ${msg}`);
    if (deployment) {
      deployment.status = 'failed';
      deployment.phase = 'complete';
      deployment.completedAt = new Date();
      deployment.failureReason = msg;
      deployment.addLog('system', 'error', `Deployment failed: ${msg}`, { error: msg }, 'azure');
      await deployment.save().catch(err => console.error('[Azure] Failed to save error state:', err));
    }
    if (io && socketId) {
      io.to(socketId).emit('deploy:error', { 
        deploymentId: deployment?._id?.toString() || deploymentId, 
        message: msg 
      });
    }
  } finally {
    await safeRemove(artifactsDir).catch(() => {});
  }
}

module.exports = { runAzureDeployment };
