import { io, Socket } from 'socket.io-client';

// Azure deploy now goes through the main backend (port 5000)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export type AzureDeployResult = {
  deploymentId: string;
  url: string;
};

export function startAzureDeploy(
  repoUrl: string,
  appName: string,
  onLog: (line: string) => void,
  onDone: (result: AzureDeployResult) => void,
  onError: (message: string) => void,
): () => void {
  const socket: Socket = io(BACKEND_URL, { transports: ['websocket'] });

  socket.on('connect', async () => {
    const socketId = socket.id;
    try {
      const res = await fetch(`${BACKEND_URL}/api/azure/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, appName, socketId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        onError(body.error || `HTTP ${res.status}`);
        socket.disconnect();
      }
    } catch (err: any) {
      onError(err.message || 'Failed to reach backend');
      socket.disconnect();
    }
  });

  socket.on('deploy:log', (msg: string) => onLog(msg));

  socket.on('deploy:done', (data: AzureDeployResult) => {
    onDone(data);
    socket.disconnect();
  });

  socket.on('deploy:error', (data: { message: string }) => {
    onError(data.message);
    socket.disconnect();
  });

  socket.on('connect_error', () => {
    onError('Cannot connect to backend. Is it running on port 5000?');
    socket.disconnect();
  });

  return () => socket.disconnect();
}
