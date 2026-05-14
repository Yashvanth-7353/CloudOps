const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function quoteShellArg(value) {
    return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

class DockerService {
    async runCommand(command, args = [], options = {}) {
        const {
            cwd = process.cwd(),
            env = {},
            onStdout = null,
            onStderr = null,
            timeoutMs = 0,
        } = options;

        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd,
                env: { ...process.env, ...env },
                shell: false,
                windowsHide: true,
            });

            let stdout = '';
            let stderr = '';
            let killedByTimeout = false;
            let timeoutHandle = null;

            if (timeoutMs > 0) {
                timeoutHandle = setTimeout(() => {
                    killedByTimeout = true;
                    child.kill();
                }, timeoutMs);
            }

            child.stdout?.on('data', (chunk) => {
                const text = chunk.toString();
                stdout += text;
                if (typeof onStdout === 'function') {
                    onStdout(text);
                }
            });

            child.stderr?.on('data', (chunk) => {
                const text = chunk.toString();
                stderr += text;
                if (typeof onStderr === 'function') {
                    onStderr(text);
                }
            });

            child.on('error', (error) => {
                if (timeoutHandle) clearTimeout(timeoutHandle);
                reject(error);
            });

            child.on('close', (code) => {
                if (timeoutHandle) clearTimeout(timeoutHandle);

                if (killedByTimeout) {
                    reject(new Error(`Command timed out after ${timeoutMs}ms: ${command} ${args.join(' ')}`));
                    return;
                }

                if (code !== 0) {
                    const error = new Error(stderr.trim() || stdout.trim() || `Command failed: ${command}`);
                    error.code = code;
                    error.stdout = stdout;
                    error.stderr = stderr;
                    reject(error);
                    return;
                }

                resolve({ stdout, stderr, code });
            });
        });
    }

    async runRemoteCommand(target, remoteCommand, options = {}) {
        const sshArgs = [];

        if (target.keyPath) {
            sshArgs.push('-i', target.keyPath);
        }

        sshArgs.push('-p', String(target.port || 22));
        sshArgs.push('-o', 'StrictHostKeyChecking=no');
        sshArgs.push('-o', 'UserKnownHostsFile=/dev/null');
        sshArgs.push(`${target.user}@${target.host}`);
        sshArgs.push(remoteCommand);

        return this.runCommand('ssh', sshArgs, options);
    }

    async copyToRemote(target, sourcePath, remoteParentPath, options = {}) {
        const scpArgs = [];

        if (target.keyPath) {
            scpArgs.push('-i', target.keyPath);
        }

        scpArgs.push('-P', String(target.port || 22));
        scpArgs.push('-o', 'StrictHostKeyChecking=no');
        scpArgs.push('-o', 'UserKnownHostsFile=/dev/null');
        scpArgs.push('-r', sourcePath);
        scpArgs.push(`${target.user}@${target.host}:${remoteParentPath}`);

        return this.runCommand('scp', scpArgs, options);
    }

    async copyFileToRemote(target, sourcePath, remotePath, options = {}) {
        const scpArgs = [];

        if (target.keyPath) {
            scpArgs.push('-i', target.keyPath);
        }

        scpArgs.push('-P', String(target.port || 22));
        scpArgs.push('-o', 'StrictHostKeyChecking=no');
        scpArgs.push('-o', 'UserKnownHostsFile=/dev/null');
        scpArgs.push(sourcePath);
        scpArgs.push(`${target.user}@${target.host}:${remotePath}`);

        return this.runCommand('scp', scpArgs, options);
    }

    async buildImage(input, maybeRepoPath) {
        if (typeof input === 'string') {
            const repoName = input;
            const repoPath = maybeRepoPath;
            return this.buildImage({
                imageName: `${repoName.toLowerCase()}:latest`,
                contextPath: repoPath,
            });
        }

        const {
            imageName,
            contextPath,
            dockerfilePath = path.join(contextPath, 'Dockerfile'),
            target = null,
            onStdout = null,
            onStderr = null,
        } = input;

        if (!contextPath || !fs.existsSync(contextPath)) {
            throw new Error(`Build context not found: ${contextPath}`);
        }

        if (!fs.existsSync(dockerfilePath)) {
            throw new Error('No Dockerfile found in build context.');
        }

        console.log(`🐳 Starting Docker build for: ${imageName}...`);

        if (target && target.type === 'ssh') {
            const remoteCommand = `cd ${quoteShellArg(target.remoteWorkspace || contextPath)} && docker build -t ${quoteShellArg(imageName)} -f Dockerfile .`;
            return this.runRemoteCommand(target, remoteCommand, { onStdout, onStderr });
        }

        return this.runCommand(
            'docker',
            ['build', '-t', imageName, '-f', dockerfilePath, contextPath],
            { onStdout, onStderr }
        );
    }

    async runContainer(input) {
        const {
            imageName,
            containerName,
            hostPort,
            containerPort,
            env = {},
            target = null,
            labels = {},
            onStdout = null,
            onStderr = null,
        } = input;

        const envEntries = Object.entries(env).filter(([, value]) => value !== undefined && value !== null && value !== '');
        const labelEntries = Object.entries(labels).filter(([, value]) => value !== undefined && value !== null && value !== '');

        if (target && target.type === 'ssh') {
            const parts = [
                'docker run -d --restart unless-stopped',
                `--name ${quoteShellArg(containerName)}`,
                `-p 127.0.0.1:${Number(hostPort)}:${Number(containerPort)}`,
            ];

            for (const [key, value] of envEntries) {
                parts.push(`-e ${quoteShellArg(`${key}=${value}`)}`);
            }

            for (const [key, value] of labelEntries) {
                parts.push(`--label ${quoteShellArg(`${key}=${value}`)}`);
            }

            parts.push(quoteShellArg(imageName));

            return this.runRemoteCommand(target, parts.join(' '), { onStdout, onStderr });
        }

        const args = [
            'run',
            '-d',
            '--restart',
            'unless-stopped',
            '--name',
            containerName,
            '-p',
            `127.0.0.1:${Number(hostPort)}:${Number(containerPort)}`,
        ];

        for (const [key, value] of envEntries) {
            args.push('-e', `${key}=${value}`);
        }

        for (const [key, value] of labelEntries) {
            args.push('--label', `${key}=${value}`);
        }

        args.push(imageName);

        return this.runCommand('docker', args, { onStdout, onStderr });
    }

    async stopContainer(containerName, target = null) {
        if (target && target.type === 'ssh') {
            return this.runRemoteCommand(target, `docker stop ${quoteShellArg(containerName)}`);
        }

        return this.runCommand('docker', ['stop', containerName]);
    }

    async restartContainer(containerName, target = null) {
        if (target && target.type === 'ssh') {
            return this.runRemoteCommand(target, `docker restart ${quoteShellArg(containerName)}`);
        }

        return this.runCommand('docker', ['restart', containerName]);
    }

    async removeContainer(containerName, target = null) {
        if (target && target.type === 'ssh') {
            return this.runRemoteCommand(target, `docker rm -f ${quoteShellArg(containerName)}`);
        }

        return this.runCommand('docker', ['rm', '-f', containerName]);
    }

    async removeImage(imageName, target = null) {
        if (target && target.type === 'ssh') {
            return this.runRemoteCommand(target, `docker rmi -f ${quoteShellArg(imageName)}`);
        }

        return this.runCommand('docker', ['rmi', '-f', imageName]);
    }

    async getContainerLogs(containerName, target = null, tail = 200) {
        if (target && target.type === 'ssh') {
            return this.runRemoteCommand(target, `docker logs --tail ${Number(tail)} ${quoteShellArg(containerName)}`);
        }

        return this.runCommand('docker', ['logs', '--tail', String(tail), containerName]);
    }
}

module.exports = new DockerService();