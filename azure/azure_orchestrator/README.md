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
azure_orchestrator/
  azure_orchestrator/  # Python orchestrator
  web_backend/         # Node.js API backend
  frontend/            # React frontend
  docker-compose.yml   # Azurite setup
  .env                 # Azure configuration
```

## Prerequisites

- Docker Desktop (running)
- Node.js 20+ (must include npm)
- Python 3.8+ (with pip)
- Git installed and available in PATH

## 1) Start Azurite

From `azure_orchestrator/` directory:

```bash
docker compose up -d
```

This starts Azurite and provides Azure Blob Storage emulation on port 10000.

## 2) Start Backend

```bash
cd web_backend
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
3. Backend clones repo into `web_backend/temp`.
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

## Azure Orchestrator Details

This folder contains:

- A small **Blob Storage** helper (works with Azurite or real Azure)
- A **zero-waste Azure Container Instances (ACI)** runner that:
  - uses `restart_policy=Never`
  - monitors container status
  - uploads container logs to Blob Storage
  - deletes the container group immediately on completion (Succeeded/Failed) and also in `finally`

### Environment variables

The code reads credentials using `os.getenv` and expects:

#### Blob Storage (required for log upload)

- **`AZURE_STORAGE_CONNECTION_STRING`**: Azure Storage connection string

#### ACI (required for deployment)

- **`AZURE_CLIENT_ID`**: Service Principal client ID
- **`AZURE_TENANT_ID`**: Azure tenant ID
- **`AZURE_CLIENT_SECRET`**: Service Principal secret
- **`AZURE_SUBSCRIPTION_ID`**: Azure subscription ID

#### ACR (required for container registry)

- **`ACR_LOGIN_SERVER`**: Azure Container Registry login server
- **`ACR_USERNAME`**: ACR username
- **`ACR_PASSWORD`**: ACR password

#### Optional

- **`AZURE_RESOURCE_GROUP`**: Resource group name (default: cloud-ops-sea)
- **`AZURE_LOCATION`**: Azure region (default: southeastasia)
  - For Azurite: `UseDevelopmentStorage=true`

Optional:

- **`AZURE_LOGS_CONTAINER`**: container to store logs (default: `cloudops-logs`)
- **`AZURE_LOGS_BLOB_NAME`**: blob name for logs (default: `<containerGroup>/<container>.txt`)

#### ACI + auth (required for running container tasks in Azure)

These are used by `DefaultAzureCredential` and the management clients:

- **`AZURE_CLIENT_ID`**
- **`AZURE_TENANT_ID`**
- **`AZURE_CLIENT_SECRET`**
- **`AZURE_SUBSCRIPTION_ID`**

ACI settings:

- **`AZURE_RESOURCE_GROUP`** (required)
- **`AZURE_LOCATION`** (required, example: `eastus`)
- **`ACI_IMAGE`** (required, example: `<ACR_LOGIN_SERVER>/<repo>:<tag>` or public image)

Optional:

- **`ACI_CONTAINER_GROUP_NAME`** (default: `cloudops-<timestamp>`)
- **`ACI_CONTAINER_NAME`** (default: `task`)
- **`ACI_CPU`** (default: `1`)
- **`ACI_MEMORY_GB`** (default: `1.5`)
- **`ACI_POLL_SECONDS`** (default: `5`)

#### ACR (optional)

Used only if you want to provide explicit registry creds for private pulls:

- **`ACR_LOGIN_SERVER`**
- **`ACR_USERNAME`**
- **`ACR_PASSWORD`**

### Install

```bash
cd azure_orchestrator
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
```

### Run (example)

Uploads two small example artifacts (summary + logs) into a container, then lists blobs.

```bash
python -m azure_orchestrator.main --container cloudops-artifacts --prefix deployments/demo-1
```

### Run ACI (zero-waste)

This creates a container group, polls until completion, uploads logs to Blob Storage, and **deletes the container group immediately**.

```bash
python -m azure_orchestrator.aci_main
```

### Notes for Azurite (Blob only)

- Start Azurite however you prefer (Docker, VS Code extension, or npm).
- Export `AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true` in your shell before running.



































from root:
docker compose up -d
docker-compose down

cd frontend
npm install  # if not done
npm run dev
# Opens at http://localhost:5173

cd azure_orchestrator/web_backend
npm install  # if not done
npm run dev
# Runs on http://localhost:5500

to kill process:
netstat -ano | findstr :5500
taskkill /PID <Pid> /F       