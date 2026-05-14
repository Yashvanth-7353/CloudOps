# CloudOps (Azure PaaS)

CloudOps is a beginner-friendly Azure PaaS learning project. It clones a GitHub repository, builds a Docker image, runs it locally, streams deploy logs to a React dashboard, and writes deployment artifacts to Azure Blob Storage using Azure SDK.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express + Socket.io
- Orchestrator: Python + Azure SDK
- Build/Runtime: Docker Desktop
- Azure Emulation: Azurite (Blob Storage)

## Project Structure

```text
cloud_mainel6/
  azure_orchestrator/
    azure_orchestrator/  # Python orchestrator
    web_backend/         # Node.js API backend
    docker-compose.yml   # Azurite setup
  frontend/              # React frontend
```

## Prerequisites

- Docker Desktop (running)
- Node.js 20+ (must include npm)
- Python 3.8+ (with pip)
- Git installed and available in PATH

## 1) Start Azurite

From `azure_orchestrator/` directory:

```bash
cd azure_orchestrator
docker compose up -d
```

This starts Azurite and provides Azure Blob Storage emulation on port 10000.

## 2) Start Backend

```bash
cd azure_orchestrator/web_backend
npm install
npm run dev
```

Backend runs on `http://localhost:5500`.

## 3) Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Deployment Flow

1. Enter a public GitHub repo URL and app name in UI.
2. Click Deploy.
3. Backend clones repo into `azure_orchestrator/web_backend/temp`.
4. If Dockerfile is missing, backend generates one.
5. Backend runs:
   - `docker build`
   - `docker rm -f <old-container>` (if any)
   - `docker run -d ...`
6. Logs stream live to frontend via Socket.io.
7. Backend saves deployment summary and logs to Azure Blob Storage.

## API Endpoints

- `GET /health`
- `GET /api/cost-insights` (mock insights)
- `POST /api/deploy`

### `POST /api/deploy` payload

```json
{
  "repoUrl": "https://github.com/owner/repo",
  "appName": "my-app",
  "socketId": "socket-id-from-frontend"
}
```

## Notes

- By default, deployed app is exposed on `http://localhost:8080`.
- Generated Dockerfile assumes Node app with `npm start`.
- For private repositories, add auth support later (PAT/SSH).
- Set `AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true` for Azurite.
