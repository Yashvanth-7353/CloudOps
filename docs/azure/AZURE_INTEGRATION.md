# Azure Integration - Backend Implementation Guide

**Date**: May 15, 2026  
**Status**: ✅ Integrated  
**Location**: `backend/src/services/azureDeployService.js` & `backend/src/routes/azureDeployRoutes.js`

---

## 🎯 What Was Integrated

The Azure deployment implementation from `azure_backend` has been successfully merged into the main CloudOps backend without affecting existing AWS functionality.

### Files Added to Main Backend

```
backend/
├── src/
│   ├── services/
│   │   └── azureDeployService.js        # ✅ NEW - Azure deployment orchestration
│   │
│   └── routes/
│       └── azureDeployRoutes.js         # ✅ NEW - Azure API endpoints
│
└── .env.example                         # ✅ UPDATED - Added Azure config vars
```

### Files Modified in Main Backend

```
backend/
└── index.js                             # ✅ UPDATED - Added Azure routes import & mount
└── package.json                         # ✅ UPDATED - Added uuid dependency
```

---

## 🏗️ Architecture Overview

### Deployment Flow: AWS vs Azure

**AWS Flow** (Existing - Phase 2):
```
Deploy Request → deploymentController 
  → deploymentService
    → gitService (clone)
    → frameworkDetector (detect framework)
    → dockerfileGenerator (generate Dockerfile)
  → AWS services (Phase 3+)
```

**Azure Flow** (New - Integrated):
```
Deploy Request → azureDeployRoutes 
  → azureDeployService
    → gitService (clone) - SHARED
    → ensureDockerfile (generate if needed)
    → Docker build & ACR push
    → Python orchestrator for ACI deployment
    → Blob Storage upload (artifacts)
```

### Key Difference: Modular Integration

```
┌─────────────────────────────────────────┐
│         Express Backend                 │
├─────────────────────────────────────────┤
│                                         │
│  Existing Routes (AWS):                │
│  ├─ /api/deploy/...                   │
│  ├─ /api/aws/...                      │
│  └─ /api/github/...                   │
│                                         │
│  NEW Routes (Azure):                   │
│  └─ /api/azure/deploy                 │
│                                         │
│  Shared Services:                      │
│  ├─ gitService.js                     │
│  ├─ frameworkDetector.js              │
│  └─ dockerfileGenerator.js            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 API Endpoints

### Azure Deployment Endpoint

```
POST /api/azure/deploy
Content-Type: application/json
Authorization: (Optional - can add JWT later)

Request Body:
{
  "repoUrl": "https://github.com/owner/repo",
  "appName": "my-app",
  "socketId": "socket-id-from-frontend"
}

Response:
{
  "message": "Azure deployment started",
  "appName": "my-app",
  "socketId": "socket-id-from-frontend"
}

Status: 202 (Accepted - deployment runs async)
```

### WebSocket Events

**From Server:**
```javascript
// Deployment started
io.to(socketId).emit('deploy:log', 'message');

// Deployment completed successfully
io.to(socketId).emit('deploy:done', { 
  deploymentId: '12345', 
  url: 'http://app.example.com' 
});

// Deployment failed
io.to(socketId).emit('deploy:error', { 
  deploymentId: '12345', 
  message: 'Error message' 
});
```

---

## ⚙️ Configuration

### Environment Variables (Add to .env)

```env
# ---- AZURE CONTAINER REGISTRY (ACR) ----
ACR_LOGIN_SERVER=yourregistry.azurecr.io
ACR_USERNAME=yourregistry
ACR_PASSWORD=your_acr_password

# ---- AZURE SERVICE PRINCIPAL ----
AZURE_CLIENT_ID=your_client_id
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_SECRET=your_secret
AZURE_SUBSCRIPTION_ID=your_subscription_id

# ---- AZURE DEPLOYMENT SETTINGS ----
AZURE_RESOURCE_GROUP=cloud-ops-sea
AZURE_LOCATION=southeastasia
AZURE_BLOB_CONTAINER=cloudops-artifacts
AZURE_PREFIX_BASE=deployments

# ---- AZURE STORAGE ----
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...

# ---- AZURE COMPUTE SETTINGS ----
ACI_CPU=1
ACI_MEMORY_GB=1.5

# ---- Python (for Azure orchestrator) ----
PYTHON=python
```

### Optional: Configuration Override

Edit `backend/src/services/azureDeployService.js` lines 15-30 to customize:

```javascript
function azureConfig() {
  return {
    acrLoginServer: process.env.ACR_LOGIN_SERVER,
    acrUsername: process.env.ACR_USERNAME,
    acrPassword: process.env.ACR_PASSWORD,
    resourceGroup: process.env.AZURE_RESOURCE_GROUP || 'cloud-ops-sea',
    location: process.env.AZURE_LOCATION || 'southeastasia',
    blobContainer: process.env.AZURE_BLOB_CONTAINER || 'cloudops-artifacts',
    prefixBase: process.env.AZURE_PREFIX_BASE || 'deployments',
    orchestratorCwd: path.resolve(__dirname, '..', '..', '..', 'azure', 'azure_orchestrator'),
    python: process.env.PYTHON || 'python',
  };
}
```

---

## 🔄 Deployment Phases

### Azure Deployment Process

```
Phase 1: Clone Repository
├─ Git clone with depth 1 (shallow)
├─ Handle errors with retry logic
└─ Status: CLONING

Phase 2: Ensure Dockerfile
├─ Check if Dockerfile exists
├─ If not, detect framework (Node, Python, Static, etc.)
├─ Auto-generate optimized Dockerfile
└─ Status: DOCKERFILE_READY

Phase 3: Docker Build
├─ Build Docker image locally
├─ Tag with ACR registry + deployment ID
├─ Stream logs to frontend via Socket.IO
└─ Status: BUILDING

Phase 4: ACR Push
├─ Login to Azure Container Registry
├─ Push image to ACR
├─ Stream logs to frontend
└─ Status: PUSHING

Phase 5: ACI Deployment
├─ Call Python orchestrator script
├─ Deploy container to Azure Container Instances
├─ Get public IP/FQDN from ACI
└─ Status: DEPLOYING

Phase 6: Upload Artifacts
├─ Save deployment summary JSON
├─ Save logs to JSON
├─ Upload to Azure Blob Storage
└─ Status: UPLOADING

Phase 7: Completion
├─ Provide app URL to user
├─ Emit deploy:done or deploy:error
└─ Status: COMPLETE/FAILED
```

---

## 🔌 Integration Points

### Shared with AWS Implementation

| Component | Usage |
|---|---|
| `gitService.js` | Repository cloning (same for both) |
| `frameworkDetector.js` | Optional: can use existing detector |
| `dockerfileGenerator.js` | Optional: can use existing generator |
| `Socket.IO` (app.set('io')) | Real-time log streaming |

### Independent Azure Components

| Component | Usage |
|---|---|
| `azureDeployService.js` | Orchestrates Azure deployment pipeline |
| `azureDeployRoutes.js` | API endpoint for Azure deployments |
| Python orchestrator | Handles ACI and Blob storage operations |

---

## 📦 Dependencies

### New Dependency Added

```json
{
  "uuid": "^14.0.0"  // For generating deployment IDs
}
```

**Install with:**
```bash
npm install
```

### External Requirements

1. **Docker**: Docker CLI must be available on system PATH
2. **Python 3.8+**: For Azure orchestrator scripts
3. **Azure CLI** (Optional): For manual testing
4. **Azure SDK Python** (Required by orchestrator):
   - `azure-identity`
   - `azure-storage-blob`
   - `azure-containerregistry`
   - `azure-mgmt-containerinstance`

---

## 🚀 How to Use

### 1. Setup Azure Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your Azure credentials
nano .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Backend

```bash
npm run dev
# or
npm start
```

### 4. Test Azure Deployment

**Via cURL:**
```bash
curl -X POST http://localhost:5000/api/azure/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/owner/repo",
    "appName": "my-app",
    "socketId": "socket-123"
  }'
```

**Via Frontend:**
1. Connect frontend to backend
2. Get socket ID from socket.io connection
3. Send deployment request with repo URL and app name
4. Monitor logs in real-time via WebSocket

---

## ✅ Verification Checklist

- [x] `azureDeployService.js` copied to `backend/src/services/`
- [x] `azureDeployRoutes.js` copied to `backend/src/routes/`
- [x] `index.js` updated with Azure route import
- [x] `index.js` updated with Azure route mount
- [x] `package.json` updated with uuid dependency
- [x] `.env.example` created with all Azure configuration
- [x] No conflicts with existing AWS routes/services
- [x] Socket.IO infrastructure available for real-time logs
- [x] Shared services (git, framework detection) compatible

---

## 🔒 Security Considerations

### Sensitive Configuration

- **Never commit `.env` file** - use `.env.example` only
- **ACR credentials** - rotate regularly
- **Service Principal** - use separate SP for non-prod environments
- **Storage connection string** - use SAS tokens in production

### Azure Permissions Required

Service Principal needs:
- `Azure Container Registry Push`
- `Contributor` on Container Instances (or custom role)
- `Storage Blob Data Contributor` for artifact uploads

---

## 📊 Monitoring & Debugging

### View Deployment Logs

Logs are streamed via Socket.IO in real-time and include:
- Repository cloning status
- Framework detection results
- Docker build output
- ACR push status
- ACI deployment status
- Artifact upload confirmation

### Troubleshooting

| Issue | Solution |
|---|---|
| ACR login fails | Verify credentials in .env, check ACR access permissions |
| Docker build fails | Check Dockerfile generation, verify Docker is running |
| ACI deployment fails | Check Azure subscription limits, verify resource group exists |
| Logs not streaming | Verify Socket.IO connection, check socketId is valid |
| Python orchestrator not found | Verify `azure/azure_orchestrator` path, install Python dependencies |

---

## 🔄 Backward Compatibility

✅ **All existing AWS functionality remains unchanged:**
- AWS deployment routes (`/api/deploy/*`) - UNCHANGED
- AWS service endpoints (`/api/aws/*`) - UNCHANGED
- GitHub integration (`/api/github/*`) - UNCHANGED
- MongoDB models - UNCHANGED
- Authentication - UNCHANGED

✅ **Azure added as optional feature:**
- New routes on `/api/azure/*` - ISOLATED
- New service - ISOLATED
- No modifications to existing controllers/services
- Can be disabled by not calling Azure endpoints

---

## 🎯 Next Steps

### Immediate (If Needed)
1. Configure Azure credentials in `.env`
2. Set up Python environment with Azure SDK
3. Test Azure deployment with sample repo
4. Integrate frontend with Azure endpoints

### Future Enhancements
- [ ] Add Azure deployment to User/Project model
- [ ] Add deployment history for Azure
- [ ] Add cost analytics for Azure
- [ ] Support multiple cloud providers in UI
- [ ] Add provider selection in deploy form
- [ ] Implement rollback for Azure deployments
- [ ] Add Azure monitoring integration

---

## 📚 File Reference

### Main Backend Files Modified

1. **backend/index.js**
   - Added: `const azureDeployRoutes = require('./src/routes/azureDeployRoutes');`
   - Added: `app.use('/api/azure', azureDeployRoutes);`

2. **backend/package.json**
   - Added: `"uuid": "^14.0.0"`

3. **backend/.env.example**
   - Created with full configuration template

### New Backend Files Created

1. **backend/src/services/azureDeployService.js** (copied from azure_backend)
   - `azureConfig()` - Configuration reader
   - `runCommand()` - Command execution helper
   - `detectFramework()` - Framework auto-detection
   - `ensureDockerfile()` - Dockerfile generation
   - `runAciViaPython()` - ACI deployment orchestration
   - `uploadArtifacts()` - Blob storage upload
   - `runAzureDeployment()` - Main entry point

2. **backend/src/routes/azureDeployRoutes.js** (copied from azure_backend)
   - `POST /api/azure/deploy` - Start Azure deployment

---

## 📞 Support & Questions

For Azure integration specific issues:
1. Check `.env` configuration
2. Verify Azure credentials and permissions
3. Review deployment logs via Socket.IO
4. Check Python orchestrator output

For general backend issues:
1. Refer to main CloudOps documentation
2. Check existing AWS integration patterns
3. Refer to API documentation

---

**Integration Status**: ✅ COMPLETE  
**Last Updated**: May 15, 2026  
**Compatible With**: CloudOps Phase 2 (Main Backend)  
**Maintains Compatibility**: YES - AWS integration unaffected
