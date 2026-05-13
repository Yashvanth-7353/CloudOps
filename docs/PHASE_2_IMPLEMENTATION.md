# Phase 2: Deployment Engine - Implementation Guide

## Overview

Phase 2 implements the core deployment engine with framework detection, Dockerfile generation, and deployment orchestration. This is the foundation for all future deployment operations.

## Implemented Components

### 1. Framework Detector (`frameworkDetector.js`)

**Purpose**: Automatically detect the technology stack of a repository

**Supported Frameworks**:
- Node.js (npm, yarn, pnpm)
- Python (pip, poetry)
- Java (Maven, Gradle)
- Go (go.mod)
- Ruby (Bundler)
- PHP (Composer)
- Rust (Cargo)
- .NET (NuGet)
- Static (HTML/CSS/JS)

**How it works**:
1. Scans repository for framework indicator files
2. Extracts version information
3. Detects installed dependencies
4. Returns framework details with confidence score

**Usage**:
```javascript
const detector = require('./frameworkDetector');
const result = await detector.detectFramework('/path/to/repo');
// Returns: {
//   framework: 'nodejs',
//   version: '18.0.0',
//   buildCommand: 'npm run build',
//   startCommand: 'npm start',
//   port: 3000,
//   packageManager: 'npm',
//   confidence: 1,
//   details: { ... }
// }
```

### 2. Dockerfile Generator (`dockerfileGenerator.js`)

**Purpose**: Generate optimized multi-stage Dockerfiles for each framework

**Features**:
- Multi-stage builds for smaller images
- Security best practices (non-root users)
- Health checks included
- Optimized layer caching
- Framework-specific optimizations

**Supported Templates**:
- Node.js with dumb-init
- Python with virtual env
- Java with multi-stage builds
- Go with Alpine
- Ruby with Bundler
- PHP with Apache
- Rust with Alpine
- .NET with ASP.NET Core
- Static with Nginx

**Usage**:
```javascript
const generator = require('./dockerfileGenerator');
const dockerfile = generator.generateDockerfile('nodejs', {
  port: 3000,
  buildCommand: 'npm run build',
  startCommand: 'npm start'
});
await generator.saveDockerfile(dockerfile, '/path/to/Dockerfile');
```

### 3. Git Service (`gitService.js`)

**Purpose**: Handle all Git operations (clone, fetch, metadata)

**Features**:
- Retry logic with exponential backoff
- Shallow cloning for speed
- Repository info extraction
- Cleanup and removal
- File listing

**Usage**:
```javascript
const git = require('./gitService');
await git.cloneRepository('https://github.com/user/repo.git', '/tmp/repo', {
  depth: 1,
  branch: 'main',
  maxRetries: 3
});
const info = await git.getRepositoryInfo('/tmp/repo');
await git.removeRepository('/tmp/repo');
```

### 4. Deployment Model (`Deployment.js`)

**Purpose**: MongoDB schema for storing deployment records

**Fields**:
- Status tracking (pending → success/failed)
- Phase tracking (clone → deploy)
- Git metadata
- Framework info
- Docker & ECS details
- Logs and error tracking
- Timing metrics
- Environment variables

**Methods**:
- `addLog()` - Add log entry
- `updateStatus()` - Update phase/status
- `markAsSuccess()` - Mark successful deployment
- `markAsFailed()` - Mark failed deployment
- `canRetry()` - Check if can retry

### 5. Deployment Service (`deploymentService.js`)

**Purpose**: Orchestrates entire deployment workflow

**Main Methods**:
- `startDeployment()` - Initialize deployment
- `executeDeployment()` - Run full deployment pipeline
- `getDeploymentDetails()` - Get status & info
- `getDeploymentLogs()` - Retrieve logs
- `listProjectDeployments()` - List all deployments
- `cancelDeployment()` - Cancel running deployment

**Workflow**:
1. Clone Repository
2. Detect Framework
3. Generate Dockerfile
4. Build Docker Image (Phase 3)
5. Push to ECR (Phase 3)
6. Deploy to ECS (Phase 3)
7. Setup DNS (Phase 5)

**Phase 2 Workflow** (Complete):
1. ✅ Clone Repository
2. ✅ Detect Framework
3. ✅ Generate Dockerfile

**Placeholder for Phase 3** (Docker/ECS):
- Docker build
- ECR push
- ECS deployment

### 6. Deployment Controller (`deploymentController.js`)

**Purpose**: HTTP request handlers for deployment endpoints

**Endpoints**:

#### POST /api/deploy/start
Start new deployment
```javascript
{
  projectId: "string (MongoDB ObjectId)",
  repositoryUrl: "string (Git URL)",
  branch: "string (optional, default: main)",
  environmentVariables: {
    "KEY": "value"
  }
}
```

#### GET /api/deploy/:deploymentId
Get deployment status and details

#### GET /api/deploy/:deploymentId/logs
Get deployment logs with filtering
```javascript
?source=git|docker|ecs
&level=info|warn|error
&limit=100
&skip=0
```

#### GET /api/deploy/:deploymentId/metrics
Get deployment metrics

#### GET /api/deploy/:deploymentId/dockerfile
Download Dockerfile

#### POST /api/deploy/:deploymentId/cancel
Cancel deployment

#### POST /api/deploy/:deploymentId/retry
Retry failed deployment

#### GET /api/projects/:projectId/deployments
List project deployments

#### GET /api/projects/:projectId/deployment-stats
Get deployment statistics

## Integration Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install simple-git mongoose
```

### Step 2: Update Models

Ensure MongoDB connection is configured in `src/config/database.js`

### Step 3: Register Routes

Update `backend/src/routes/index.js`:

```javascript
const deploymentRoutes = require('./deploymentRoutes');

router.use('/deploy', deploymentRoutes);
router.use('/projects/:projectId/deployments', deploymentRoutes);
```

### Step 4: Update Main App

Update `backend/src/app.js` to mount deployment routes:

```javascript
const deploymentRoutes = require('./routes/deploymentRoutes');
app.use('/api/deploy', deploymentRoutes);
```

### Step 5: Test Endpoints

```bash
# Start deployment
curl -X POST http://localhost:5000/api/deploy/start \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "repositoryUrl": "https://github.com/user/repo.git",
    "environmentVariables": { "NODE_ENV": "production" }
  }'

# Get deployment status
curl -X GET http://localhost:5000/api/deploy/DEPLOYMENT_ID \
  -H "Authorization: Bearer TOKEN"

# Get deployment logs
curl -X GET http://localhost:5000/api/deploy/DEPLOYMENT_ID/logs \
  -H "Authorization: Bearer TOKEN"
```

## Testing Phase 2

### Unit Tests

```bash
npm test -- --testPathPattern=deployment
```

### Integration Tests

1. **Test Framework Detection**:
   - Node.js repo
   - Python repo
   - Go repo
   - Static HTML repo

2. **Test Dockerfile Generation**:
   - All 9 framework types
   - Verify multi-stage builds
   - Check security practices

3. **Test Git Operations**:
   - Successful clone
   - Retry logic
   - Large repo handling
   - Shallow clone

4. **Test Deployment Flow**:
   - Start deployment
   - Get status
   - Stream logs
   - Cancel deployment

### Manual Testing

```bash
# 1. Create test repository
mkdir test-repo
cd test-repo
git init
echo "console.log('Hello');" > index.js
echo '{"name": "test", "version": "1.0.0"}' > package.json
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/test-repo
git push -u origin main

# 2. Start deployment
curl -X POST http://localhost:5000/api/deploy/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "repositoryUrl": "https://github.com/yourusername/test-repo.git"
  }'

# 3. Check status
curl -X GET http://localhost:5000/api/deploy/RETURNED_DEPLOYMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. View logs
curl -X GET http://localhost:5000/api/deploy/RETURNED_DEPLOYMENT_ID/logs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### Deployment Collection

```javascript
db.deployments.findOne()
{
  _id: ObjectId,
  projectId: ObjectId,
  userId: ObjectId,
  status: "success|failed|pending|cloning|detecting|building|pushing|deploying|cancelled",
  phase: "preparation|clone|framework_detection|dockerfile_generation|docker_build|push_ecr|ecs_deploy|dns_setup|complete",
  
  // Git Info
  commitHash: "abc123...",
  commitShortHash: "abc123",
  commitMessage: "Initial commit",
  commitAuthor: "John Doe",
  branch: "main",
  repositoryUrl: "https://github.com/...",
  
  // Framework
  framework: "nodejs|python|java|go|ruby|php|rust|dotnet|static",
  frameworkVersion: "18.0.0",
  frameworkDetails: { /* detected details */ },
  
  // Docker
  dockerfile: "FROM node:18-alpine\n...",
  dockerImageUri: "123456789.dkr.ecr.us-east-1.amazonaws.com/project:tag",
  dockerImageTag: "latest",
  dockerBuildTime: 240000, // ms
  dockerImageSize: 150000000, // bytes
  
  // Timing
  buildTime: 240000,
  deployTime: 180000,
  totalTime: 420000,
  startedAt: ISODate("2024-05-13T10:00:00Z"),
  completedAt: ISODate("2024-05-13T10:07:00Z"),
  
  // Environment
  environmentVariables: [
    { key: "NODE_ENV", value: "production", encrypted: false }
  ],
  
  // Logs
  logs: [
    {
      timestamp: ISODate("2024-05-13T10:00:05Z"),
      source: "git|docker|framework|system",
      level: "info|warn|error|debug",
      message: "Repository cloned successfully",
      data: { /* additional data */ }
    }
  ],
  
  // Error
  error: {
    message: "Error message",
    code: "ERROR_CODE",
    phase: "docker_build",
    timestamp: ISODate("2024-05-13T10:05:00Z"),
    stack: "Error stack trace"
  },
  
  createdAt: ISODate("2024-05-13T10:00:00Z"),
  updatedAt: ISODate("2024-05-13T10:07:00Z")
}
```

## Deployment Log Entry Example

```javascript
{
  timestamp: ISODate("2024-05-13T10:00:10Z"),
  source: "git",
  level: "info",
  message: "Repository cloned successfully",
  data: {
    path: "/tmp/cloudops-abc123",
    duration: "2.5s",
    size: "5.2MB"
  }
}
```

## Next Steps (Phase 3)

### Integration Points for Phase 3:

1. **Docker Build Service** (`dockerService.js`)
   - Build Docker images locally
   - Tag and optimize images
   - Handle build failures with retries

2. **AWS ECR Integration** (`awsService/ecrService.js`)
   - Create ECR repositories dynamically
   - Authenticate with ECR
   - Push images

3. **AWS ECS Integration** (`awsService/ecsService.js`)
   - Create task definitions
   - Create/update ECS services
   - Monitor task status

4. **Job Queue System** (Redis + BullMQ)
   - Queue deployment jobs
   - Process jobs concurrently
   - Handle retries

## Troubleshooting

### Common Issues

1. **Framework Not Detected**
   - Check indicator files exist in repository
   - Verify repository structure
   - Check detector logs

2. **Dockerfile Generation Fails**
   - Verify framework is correctly detected
   - Check for special characters in config
   - Verify port is valid

3. **Repository Clone Fails**
   - Check Git URL is valid
   - Verify authentication if private repo
   - Check network connectivity

4. **Logs Not Showing**
   - Check deployment status
   - Verify deployment exists
   - Check authorization

## Performance Metrics

### Phase 2 Benchmarks (Local Testing)

- **Repository Clone**: 5-30 seconds (depends on repo size)
- **Framework Detection**: 1-2 seconds
- **Dockerfile Generation**: 0.5 seconds
- **Total Phase 2 Time**: 7-35 seconds

### Expected Disk Usage

- **Build Directory**: 50-500 MB (repository size)
- **Dockerfile**: 2-5 KB
- **Logs**: 1-10 MB per deployment

## File Structure

```
backend/src/
├── services/
│   ├── frameworkDetector.js       # Framework detection
│   ├── dockerfileGenerator.js      # Dockerfile generation
│   ├── gitService.js               # Git operations
│   └── deploymentService.js        # Deployment orchestration
├── models/
│   └── Deployment.js               # MongoDB schema
├── controllers/
│   └── deploymentController.js     # HTTP handlers
├── routes/
│   └── deploymentRoutes.js         # API routes
├── validators/
│   └── deploymentValidator.js      # Request validation
└── middleware/
    └── authMiddleware.js           # Authentication
```

## API Response Examples

### Start Deployment (Success)
```json
{
  "success": true,
  "deploymentId": "507f1f77bcf86cd799439011",
  "status": "queued",
  "message": "Deployment started"
}
```

### Get Deployment Status
```json
{
  "success": true,
  "deployment": {
    "_id": "507f1f77bcf86cd799439011",
    "projectId": "507f1f77bcf86cd799439010",
    "status": "success",
    "phase": "complete",
    "framework": "nodejs",
    "commitShortHash": "abc123d",
    "commitMessage": "Add new feature",
    "publicUrl": "https://project-1234.cloudops.dev",
    "totalTime": 420000,
    "startedAt": "2024-05-13T10:00:00Z",
    "completedAt": "2024-05-13T10:07:00Z",
    "logs": [ /* array of log entries */ ]
  }
}
```

### Get Deployment Logs
```json
{
  "success": true,
  "logs": [
    {
      "timestamp": "2024-05-13T10:00:05Z",
      "source": "git",
      "level": "info",
      "message": "Repository cloned successfully"
    },
    {
      "timestamp": "2024-05-13T10:00:08Z",
      "source": "framework",
      "level": "info",
      "message": "Framework detected: nodejs"
    }
  ],
  "total": 25
}
```

---

**Status**: ✅ Phase 2 Complete
**Next**: Proceed to Phase 3 for AWS Integration
