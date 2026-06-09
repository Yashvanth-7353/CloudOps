# CloudOps — Implementation Details

This document captures the implemented design, technology stack, APIs, and runtime behavior as present in the repository (no assumptions).

## Idea
CloudOps is a cloud deployment platform that clones GitHub repositories, builds Docker images, runs applications locally or on cloud (AWS EC2 or Azure ACI), streams deployment logs to a React dashboard, and stores deployment artifacts and metadata.

## Technologies (actual files)
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, TanStack Query, Zustand, Axios, Socket.IO client. See [frontend/package.json](frontend/package.json) and [frontend/README.md](frontend/README.md).
- Backend: Node.js + Express, Socket.IO server, Mongoose (MongoDB), simple-git, Docker CLI orchestration, JWT auth, AWS SDK v3. See [backend/package.json](backend/package.json) and [backend/index.js](backend/index.js).
- Azure Orchestrator: Python scripts using Azure SDK and Azurite. See `azure/azure_orchestrator` (e.g., [azure/azure_orchestrator/azure_orchestrator/aci_runner.py](azure/azure_orchestrator/azure_orchestrator/aci_runner.py)).

## Implemented Features (what's in code)
- Repository cloning and initialization endpoint that returns clone path, file tree, and Dockerfile presence (`POST /api/deploy/init`). See [backend/src/routes/deploymentRoutes.js](backend/src/routes/deploymentRoutes.js) and `initDeploy` in [backend/src/controllers/deploymentController.js](backend/src/controllers/deploymentController.js).
- Deployment engine with a job queue: clone → detect framework → require Dockerfile → build image → run container (local/SSH) or push to ECR + launch EC2 for AWS. Implemented in [backend/src/services/deploymentEngineService.js](backend/src/services/deploymentEngineService.js).
- Framework detection and Dockerfile templates for Node/Python/Go/Java/Ruby/PHP/Rust/.NET/static. See [backend/src/services/frameworkDetector.js](backend/src/services/frameworkDetector.js) and [backend/src/services/dockerfileGenerator.js](backend/src/services/dockerfileGenerator.js).
- Docker operations (build/run/stop/remove) with streamed stdout/stderr and Docker checks. See [backend/src/services/dockerService.js](backend/src/services/dockerService.js).
- AWS flow: tag & push image to ECR, create or reuse repository, and launch EC2 instance with user-data to pull and run the image. See [backend/src/services/awsDeploymentEngineService.js](backend/src/services/awsDeploymentEngineService.js) and `backend/src/services/aws/*`.
- Azure flow: `POST /api/azure/deploy` triggers async deployment/orchestration which uses Python scripts under `azure/azure_orchestrator/azure_orchestrator` to create ACI and upload artifacts to Blob Storage (Azurite). See [backend/src/routes/azureDeployRoutes.js](backend/src/routes/azureDeployRoutes.js) and `azure/azure_orchestrator`.
- GitHub webhook handling, signature verification, and webhook-triggered redeploy logic. See `handleWebhook` in [backend/src/controllers/deploymentController.js](backend/src/controllers/deploymentController.js) and `verifyWebhookSignature` in [backend/src/services/deploymentEngineService.js](backend/src/services/deploymentEngineService.js).
- Real-time logs via Socket.IO: backend Socket.IO server lives in [backend/index.js](backend/index.js) and logs are emitted from the deployment engine (`emitLog`). Frontend has a `useSocket` hook; socket provider initialization is present but connection code is TODO (see [frontend/src/app/providers/socket-provider.tsx](frontend/src/app/providers/socket-provider.tsx)).
- Persistent models for projects, deployments, and users using Mongoose. See [backend/src/models/Project.js](backend/src/models/Project.js), [backend/src/models/Deployment.js](backend/src/models/Deployment.js), [backend/src/models/User.js](backend/src/models/User.js).

## API Endpoints (implemented)
- Deployment: `POST /api/deploy/init`, `POST /api/deploy/start` (also `/api/deploy/start-build`), `POST /api/deploy/aws-ec2`, `GET /api/deploy/:id/status`, `GET /api/deploy/:id/logs`, `POST /api/deploy/:id/stop`, `POST /api/deploy/:id/restart`. (See [backend/src/routes/deploymentRoutes.js](backend/src/routes/deploymentRoutes.js).)
- Azure: `POST /api/azure/deploy` — starts Azure deployment asynchronously. (See [backend/src/routes/azureDeployRoutes.js](backend/src/routes/azureDeployRoutes.js).)
- AWS: `/api/aws/*` routes for EC2, S3, ECR, deployments (see [backend/src/routes/awsRoutes.js](backend/src/routes/awsRoutes.js)).
- General API & analytics: routes under [backend/src/routes/apiRoutes.js](backend/src/routes/apiRoutes.js) (health, deployments listing, analytics placeholders, billing endpoints, `POST /api/predict-cost`).
- User: `GET /api/users/me` (see [backend/src/routes/userRoutes.js](backend/src/routes/userRoutes.js)).

## Implementation Flow (detailed)
1. Frontend calls `POST /api/deploy/start` or `POST /api/deploy/start-build` (via `frontend/src/services/deployment-service.ts`).
2. Backend `deploymentController.startBuild` resolves project context and calls `deploymentEngine.startDeployment`.
3. `deploymentEngine` creates a `Deployment` document (status queued), clones the repo (`gitService.cloneRepository`), records commit metadata, and runs framework detection.
4. Engine requires a `Dockerfile` at repository root; if missing, it errors (see `detectAndGenerate`).
5. Docker image is built (`dockerService.buildImage`), build logs are emitted to MongoDB logs and Socket.IO rooms.
6. If target is AWS, engine pushes image to ECR and launches EC2 using `awsDeploymentEngine`; otherwise it runs container locally or on SSH remote and configures Nginx for proxying.
7. Engine updates `Deployment` document throughout phases and emits `deployment-log` and `deployment-complete` events via Socket.IO.

## Data Models (key fields)
- `Project` — `userId`, `repositoryName`, `repositoryOwner`, `repositoryUrl`, `environmentVariables`, `githubWebhookId`, `webhookSecret`. See [backend/src/models/Project.js](backend/src/models/Project.js).
- `Deployment` — stores lifecycle fields: `status`, `phase`, git metadata, `framework`, `dockerImageUri`, `infrastructure` (aws/azure/container), `logs`, `awsLogs`, `azureLogs`, `publicUrl`, timings, `metadata`. Methods: `addLog`, `markAsSuccess`, `markAsFailed`. See [backend/src/models/Deployment.js](backend/src/models/Deployment.js).
- `User` — `githubId`, `username`, `email`, `avatar`, `githubAccessToken`. See [backend/src/models/User.js](backend/src/models/User.js).

## Files & locations (where to look)
- Root README: [README.md](README.md)
- Backend bootstrap & Socket.IO: [backend/index.js](backend/index.js)
- Deployment engine: [backend/src/services/deploymentEngineService.js](backend/src/services/deploymentEngineService.js)
- Docker helper: [backend/src/services/dockerService.js](backend/src/services/dockerService.js)
- Git helper: [backend/src/services/gitService.js](backend/src/services/gitService.js)
- AWS engine: [backend/src/services/awsDeploymentEngineService.js](backend/src/services/awsDeploymentEngineService.js)
- Azure orchestrator: `azure/azure_orchestrator/azure_orchestrator/*` (e.g., [azure/azure_orchestrator/azure_orchestrator/aci_runner.py](azure/azure_orchestrator/azure_orchestrator/aci_runner.py))
- Frontend services: `frontend/src/services/*` and pages in `frontend/src/pages/*` (see `frontend/README.md`).

## How to run (as documented)
- Backend (from `backend/`):
```bash
npm install
cp .env.example .env    # create and set required env vars
npm start
```

- Frontend (from `frontend/`):
```bash
npm install
npm run dev
```

- Azure orchestrator (optional): start Azurite in `azure/azure_orchestrator` and run Python orchestrator per `azure/README.md`.

## Explicit caveats & TODOs (from code)
- Frontend socket provider has TODOs: `frontend/src/app/providers/socket-provider.tsx` contains placeholder code and does not initialize the Socket.IO client.
- The deployment engine requires a `Dockerfile` in the repository root; if absent, deployment will fail (the engine explicitly errors).
- Some analytics/billing endpoints are placeholders/mocks; check controllers for actual behavior if required.

## Next steps (optional)
- If you want, I can replace the placeholder socket initialization in `frontend/src/app/providers/socket-provider.tsx` to connect the frontend to the backend Socket.IO server and enable real-time logs. I can also add this file to the root README or replace the root README content with this consolidated doc.

---
Generated from repository analysis on May 25, 2026.
