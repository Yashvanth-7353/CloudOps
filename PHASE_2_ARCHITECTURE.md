# Phase 2: Deployment Engine - Architecture Overview

## 🏗️ Complete Workflow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLOUDOPS PHASE 2: DEPLOYMENT ENGINE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FRONTEND (React)                                                           │
│  ┌──────────────────────────────────┐                                      │
│  │ Deploy Button                    │                                      │
│  │ - Select project                 │                                      │
│  │ - Enter env vars                 │                                      │
│  │ - Click Deploy                   │                                      │
│  └────────────────┬─────────────────┘                                      │
│                   │                                                        │
│                   ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │        API GATEWAY                                                  │ │
│  │  POST /api/deploy/start                                            │ │
│  │  {                                                                 │ │
│  │    projectId: "...",                                              │ │
│  │    repositoryUrl: "...",                                          │ │
│  │    environmentVariables: {}                                       │ │
│  │  }                                                                 │ │
│  └────────────────┬─────────────────────────────────────────────────┘ │
│                   │                                                    │
│                   ▼                                                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │     DEPLOYMENT CONTROLLER                                          │ │
│  │  startDeployment()                                                 │ │
│  │  - Validate input                                                 │ │
│  │  - Create Deployment record                                       │ │
│  │  - Queue job (Phase 6)                                            │ │
│  │  - Return deploymentId                                            │ │
│  └────────────────┬────────────────────────────────────────────────┘ │
│                   │                                                  │
│                   ▼ (Front-end returns with deploymentId)           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │     DEPLOYMENT SERVICE (Orchestrator)                              │ │
│  │  executeDeployment(deploymentId)                                  │ │
│  │                                                                   │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ PHASE 1: CLONE REPOSITORY                              │   │ │
│  │  │ ┌────────────────────────────────────────────────────┐ │   │ │
│  │  │ │ Git Service                                       │ │   │ │
│  │  │ │ - Clone repo with retry logic                    │ │   │ │
│  │  │ │ - Extract commit info                            │ │   │ │
│  │  │ │ - Path: /tmp/cloudops-{uuid}                     │ │   │ │
│  │  │ │ - Depth: 1 (shallow clone)                       │ │   │ │
│  │  │ │ - Result: ✅ Repository ready                    │ │   │ │
│  │  │ └────────────────────────────────────────────────────┘ │   │ │
│  │  │ Status: CLONING → Logs stored in DB                │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                           ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ PHASE 2: FRAMEWORK DETECTION                            │   │ │
│  │  │ ┌────────────────────────────────────────────────────┐ │   │ │
│  │  │ │ Framework Detector                                │ │   │ │
│  │  │ │ - Scan for package.json (Node)                   │ │   │ │
│  │  │ │ - Scan for requirements.txt (Python)              │ │   │ │
│  │  │ │ - Scan for go.mod (Go)                           │ │   │ │
│  │  │ │ - Scan for pom.xml (Java)                        │ │   │ │
│  │  │ │ - Extract versions                               │ │   │ │
│  │  │ │ - Detect dependencies                            │ │   │ │
│  │  │ │ - Result: Framework name + details               │ │   │ │
│  │  │ └────────────────────────────────────────────────────┘ │   │ │
│  │  │ Status: DETECTING → Save to deployment record      │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                           ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ PHASE 3: DOCKERFILE GENERATION                          │   │ │
│  │  │ ┌────────────────────────────────────────────────────┐ │   │ │
│  │  │ │ Dockerfile Generator                              │ │   │ │
│  │  │ │ - Select template (nodejs/python/java/etc)        │ │   │ │
│  │  │ │ - Generate multi-stage Dockerfile                 │ │   │ │
│  │  │ │ - Include health checks                           │ │   │ │
│  │  │ │ - Security: non-root user                         │ │   │ │
│  │  │ │ - Save Dockerfile to repo                         │ │   │ │
│  │  │ │ - Save .dockerignore                              │ │   │ │
│  │  │ │ - Result: Ready for docker build                  │ │   │ │
│  │  │ └────────────────────────────────────────────────────┘ │   │ │
│  │  │ Status: BUILDING → Dockerfile in database            │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                           ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ PHASE 4-7: PLACEHOLDER FOR PHASE 3                      │   │ │
│  │  │ (Docker build, ECR push, ECS deploy, DNS setup)         │   │ │
│  │  │ Status: PUSHING → [Phase 3 will implement]              │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  │                           ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │ DEPLOYMENT COMPLETE                                      │   │ │
│  │  │ - Status: SUCCESS                                        │   │ │
│  │  │ - Public URL: https://project-{id}.cloudops.dev          │   │ │
│  │  │ - All logs stored in database                            │   │ │
│  │  │ - Metrics calculated                                     │   │ │
│  │  └──────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  DATABASE (MongoDB)                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Deployment Record                                                │ │
│  │ {                                                                │ │
│  │   _id: ObjectId,                                               │ │
│  │   status: "cloning|detecting|building|pushing|deploying|...",  │ │
│  │   phase: "clone|framework_detection|dockerfile_generation|...", │
│  │   framework: "nodejs|python|java|go|...",                      │ │
│  │   commitHash: "abc123...",                                      │ │
│  │   dockerfile: "FROM node:18...",                                │ │
│  │   logs: [ /* 50+ log entries */ ],                              │ │
│  │   totalTime: 420000,                                            │ │
│  │   startedAt: ISODate,                                           │ │
│  │   completedAt: ISODate                                          │ │
│  │ }                                                                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  FRONTEND (Real-time Updates)                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Deployment Status Page                                           │ │
│  │ GET /api/deploy/:deploymentId                                   │ │
│  │ - Status updates every 2 seconds                                │ │
│  │ - Show current phase                                            │ │
│  │ - Display logs in real-time                                     │ │
│  │ - Show progress bar                                             │ │
│  │ - On success: Show public URL                                   │ │
│  │ - On error: Show error message                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📂 File Dependencies

```
deploymentController.js
├── deploymentService.js
│   ├── frameworkDetector.js
│   ├── dockerfileGenerator.js
│   ├── gitService.js
│   └── Deployment (Model)
│       └── [Logs, phases, status]
├── Deployment (Model)
└── MongoDB

deploymentRoutes.js
├── deploymentController.js
├── authMiddleware.js
└── deploymentValidator.js
    ├── (Validates URLs, env vars, branch names)
```

## 🔄 Data Flow Example

### Request Flow: Start Deployment

```
1. Frontend
   POST /api/deploy/start
   {
     projectId: "507f1f77bcf86cd799439010",
     repositoryUrl: "https://github.com/user/repo.git",
     environmentVariables: { NODE_ENV: "production" }
   }

2. Route Handler (deploymentRoutes.js)
   ├── Validate with deploymentValidator
   └── Call deploymentController.startDeployment()

3. Deployment Controller
   ├── Extract user from token
   ├── Call deploymentService.startDeployment()
   └── Return { deploymentId, status: "queued" }

4. Deployment Service
   ├── Create Deployment document in MongoDB
   │   status: "pending"
   │   phase: "preparation"
   │   logs: [initialization log]
   ├── Save to DB
   └── Return deploymentId

5. Async Execution (Phase 2 synchronous, Phase 6 queue-based)
   ├── executeDeployment(deploymentId)
   │   ├── Phase 1: Clone Repository
   │   │   ├── gitService.cloneRepository()
   │   │   ├── gitService.getRepositoryInfo()
   │   │   └── Update deployment: commitHash, branch, etc.
   │   │
   │   ├── Phase 2: Framework Detection
   │   │   ├── frameworkDetector.detectFramework()
   │   │   └── Update deployment: framework, version, details
   │   │
   │   ├── Phase 3: Dockerfile Generation
   │   │   ├── dockerfileGenerator.generateDockerfile()
   │   │   ├── Save Dockerfile
   │   │   └── Update deployment: dockerfile content
   │   │
   │   ├── Phase 4+: AWS Integration (Phase 3)
   │   │   └── [Placeholder for Phase 3 implementation]
   │   │
   │   └── Mark deployment as success/failed
   │
   └── Update status in MongoDB

6. Frontend (Polling)
   GET /api/deploy/:deploymentId
   ├── Fetch latest deployment status
   ├── Display phase & logs
   └── Refresh every 2 seconds
```

## 🎯 Phase 2 Deliverables

### Core Services (3)
- ✅ **Framework Detector**: Identifies 9 framework types
- ✅ **Dockerfile Generator**: Creates optimized Dockerfiles
- ✅ **Git Service**: Clones and manages repositories

### Orchestration (1)
- ✅ **Deployment Service**: Orchestrates entire workflow

### HTTP API (1)
- ✅ **Deployment Controller**: 9 endpoints

### Routes & Validation (2)
- ✅ **Deployment Routes**: API endpoint mapping
- ✅ **Deployment Validator**: Input validation

### Data Models (1)
- ✅ **Deployment Model**: MongoDB schema

### Documentation (2)
- ✅ **Phase 2 Implementation Guide**: Complete reference
- ✅ **Integration Checklist**: Step-by-step setup

---

## 🚀 API Endpoint Map

```
POST /api/deploy/start
├── Input: { projectId, repositoryUrl, environmentVariables, branch }
└── Output: { deploymentId, status: "queued" }

GET /api/deploy/:deploymentId
├── Input: deploymentId (URL param)
└── Output: { status, phase, framework, logs[], publicUrl, metrics }

GET /api/deploy/:deploymentId/logs
├── Input: deploymentId, ?source, ?level, ?limit, ?skip
└── Output: { logs: [], total }

GET /api/deploy/:deploymentId/metrics
├── Input: deploymentId
└── Output: { status, totalTime, dockerSize, logCount }

GET /api/deploy/:deploymentId/dockerfile
├── Input: deploymentId
└── Output: [Plain text Dockerfile content]

POST /api/deploy/:deploymentId/cancel
├── Input: deploymentId
└── Output: { status: "cancelled" }

POST /api/deploy/:deploymentId/retry
├── Input: deploymentId
└── Output: { message: "Retry initiated" }

GET /api/projects/:projectId/deployments
├── Input: projectId, ?status, ?limit, ?skip
└── Output: { deployments: [], total }

GET /api/projects/:projectId/deployment-stats
├── Input: projectId
└── Output: { totalDeployments, successRate, avgTime }
```

---

## 📊 Database Schema Snapshot

```
Deployments Collection
├── Indexed fields:
│   ├── { projectId: 1, createdAt: -1 }
│   ├── { userId: 1, createdAt: -1 }
│   ├── { status: 1, createdAt: -1 }
│   └── { publicUrl: 1 } (sparse)
│
└── Nested documents:
    ├── logs[]: { timestamp, source, level, message, data }
    ├── environmentVariables[]: { key, value, encrypted }
    └── error: { message, code, phase, timestamp, stack }
```

---

## ⏱️ Timing Breakdown (Phase 2)

| Phase | Operation | Time | Status |
|-------|-----------|------|--------|
| 1 | Clone (shallow) | 5-30s | ✅ |
| 2 | Framework detect | 1-2s | ✅ |
| 3 | Dockerfile gen | 0.5s | ✅ |
| 4 | Docker build | TBD (Phase 3) | ⏳ |
| 5 | ECR push | TBD (Phase 3) | ⏳ |
| 6 | ECS deploy | TBD (Phase 3) | ⏳ |
| 7 | DNS setup | TBD (Phase 5) | ⏳ |
| **Total (Phase 2)** | **~7-35 seconds** | ✅ |

---

## 🔐 Security Features (Phase 2)

- ✅ JWT authentication on all endpoints
- ✅ Authorization checks (user owns deployment)
- ✅ Environment variable handling
- ✅ Git URL validation
- ✅ Branch name validation
- ✅ Input sanitization

---

## 🧪 Testing Coverage

### Framework Detection Tests
- ✅ Node.js projects (multiple package managers)
- ✅ Python projects
- ✅ Java projects
- ✅ Go projects
- ✅ Static HTML sites

### Dockerfile Generation Tests
- ✅ Multi-stage builds
- ✅ Health checks
- ✅ Non-root users
- ✅ Environment variables

### Git Operations Tests
- ✅ Successful clone
- ✅ Retry logic
- ✅ Repository cleanup
- ✅ Info extraction

### API Endpoint Tests
- ✅ Start deployment
- ✅ Get status
- ✅ Get logs
- ✅ Cancel/retry
- ✅ Get metrics

---

## 🎓 Learning Resources

- Dockerfile best practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Simple Git documentation: https://github.com/steveukx/git-js
- MongoDB schema design: https://docs.mongodb.com/manual/core/data-model-design/

---

**Phase 2 Status**: ✅ COMPLETE & READY FOR INTEGRATION

**Next Phase**: Phase 3 - AWS Integration (ECR, ECS, IAM)

**Estimated Timeline**: 3-4 weeks for Phase 3
