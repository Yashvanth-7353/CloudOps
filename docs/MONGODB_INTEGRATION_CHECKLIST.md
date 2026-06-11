# MongoDB Implementation Integration Checklist

## ✅ What's Done

- ✅ Database initialized with all indexes
- ✅ Backend server running with new models
- ✅ AuditLog model created for audit trail
- ✅ EnhancedLogger utility available
- ✅ DatabaseUtilities for safe operations
- ✅ All collections created
- ✅ Maintenance scripts ready

## 🔄 Services to Update (Gradual Migration)

The system is backward-compatible, but services should gradually migrate to new logging. Update these files to use enhanced logging:

### 1. **deploymentEngineService.js**
Replace:
```javascript
const { pushDeploymentLog, updateDeploymentFields } = require('../utils/deploymentPersistence');

// OLD
await pushDeploymentLog(deploymentId, { message, source, level });

// NEW
const { EnhancedLogger } = require('../utils/deploymentPersistence');
await EnhancedLogger.addDeploymentLog(deploymentId, { 
  source: 'system',
  level: 'info',
  message: 'Status changed to building',
  deploymentService: 'aws'
});
```

### 2. **gitService.js**
Add timing and context:
```javascript
const startTime = new Date();
// ... clone repo ...
const duration = Date.now() - startTime;

await DatabaseUtilities.recordPhaseTiming(deploymentId, 'clone', {
  duration: duration
});
```

### 3. **frameworkDetectionService.js**
```javascript
await DatabaseUtilities.recordPhaseTiming(deploymentId, 'framework_detection', {
  duration: duration
});
```

### 4. **dockerBuildService.js**
```javascript
// Record timing
await DatabaseUtilities.recordPhaseTiming(deploymentId, 'docker_build', {
  duration: buildTime
});

// Safe infrastructure update
await DatabaseUtilities.updateInfrastructure(deploymentId, 'ecr', {
  imageUri: imageUri,
  imageTag: imageTag,
  imageSha: imageSha
});
```

### 5. **awsDeploymentEngineService.js**
```javascript
// Update status with audit trail
await EnhancedLogger.updateDeploymentStatus(deploymentId, {
  newStatus: 'deploying',
  newPhase: 'ecs_deploy',
  reason: 'system_event'
});

// Record error with context
await EnhancedLogger.recordDeploymentError(deploymentId, error, {
  phase: 'ecs_deploy',
  source: 'ecs',
  recoveryAction: 'Retry deployment'
});
```

### 6. **azureDeployService.js**
Same pattern as AWS service.

## 📊 Monitoring Your Data

### Check Recent Deployments
```bash
# In MongoDB shell
db.deployments.find({}).sort({ createdAt: -1 }).limit(5).pretty()
```

### View Audit Trail for Specific Deployment
```bash
db.auditLogs.find({ 
  entityType: 'deployment',
  entityId: ObjectId('<deployment_id>')
}).sort({ timestamp: -1 }).pretty()
```

### Check Timing Metrics
```bash
db.deployments.findOne(
  { _id: ObjectId('<deployment_id>') },
  { phaseMetrics: 1 }
).pretty()
```

### View User Activity
```bash
db.auditLogs.find({ userId: '<user_id>' }).sort({ timestamp: -1 }).limit(20).pretty()
```

## 🛠️ Running Maintenance

### Archive Old Deployments
```bash
# See what would be archived (dry-run)
node backend/scripts/maintainDatabase.js --days=90 --dry-run

# Actually archive them
node backend/scripts/maintainDatabase.js --days=90
```

### Validate Data Integrity
```bash
node backend/scripts/maintainDatabase.js --validate-all
```

### Repair Issues
```bash
# Dry run first
node backend/scripts/maintainDatabase.js --repair --dry-run

# Then run for real
node backend/scripts/maintainDatabase.js --repair
```

### Clean Up Old Audit Logs
```bash
# Logs older than 30 days (or auto-cleanup after 90 days via TTL)
node backend/scripts/maintainDatabase.js --cleanup-logs
```

## 🔍 Debugging

### Check if deployment is valid
```javascript
const { DatabaseUtilities } = require('./backend/src/utils/databaseUtilities');
const result = await DatabaseUtilities.validateDeploymentIntegrity(deploymentId);
console.log(result);
```

### Create backup snapshot
```javascript
const { DatabaseUtilities } = require('./backend/src/utils/databaseUtilities');
await DatabaseUtilities.createDeploymentSnapshot(deploymentId, 'manual_backup');
```

### Get deployment with full audit history
```javascript
const { DatabaseUtilities } = require('./backend/src/utils/databaseUtilities');
const { deployment, auditHistory } = await DatabaseUtilities.getDeploymentWithAudit(deploymentId);
```

## 📝 Best Practices When Updating Services

### Always Use EnhancedLogger
```javascript
// ✅ GOOD
await EnhancedLogger.addDeploymentLog(deploymentId, {
  source: 'docker',
  level: 'success',
  message: 'Image built successfully',
  data: { imageSha: '123abc' },
  deploymentService: 'aws'
});

// ❌ AVOID
console.log('Image built');
await pushDeploymentLog(deploymentId, {...});
```

### Always Record Phase Timing
```javascript
// ✅ GOOD
const start = Date.now();
// ... do work ...
await DatabaseUtilities.recordPhaseTiming(deploymentId, 'clone', {
  duration: Date.now() - start
});

// ❌ AVOID
// ... do work without recording time ...
```

### Use Safe Infrastructure Updates
```javascript
// ✅ GOOD
await DatabaseUtilities.updateInfrastructure(deploymentId, 'ec2', {
  instanceId: 'i-123',
  publicIp: '1.2.3.4',
  status: 'running'
});

// ❌ AVOID
await Deployment.updateOne(
  { _id: deploymentId },
  { $set: { 'infrastructure.ec2.instanceId': 'i-123' } }
);
```

### Create Snapshots Before Major Changes
```javascript
// ✅ GOOD
await DatabaseUtilities.createDeploymentSnapshot(deploymentId, 'pre_redeploy');
// ... perform redeploy ...

// ❌ AVOID
// ... no backup ...
```

### Handle Errors with Context
```javascript
// ✅ GOOD
try {
  // ... deployment code ...
} catch (error) {
  await EnhancedLogger.recordDeploymentError(deploymentId, error, {
    phase: 'docker_build',
    source: 'docker',
    userId: 'system',
    recoveryAction: 'Increase Docker timeout and retry'
  });
}

// ❌ AVOID
try {
  // ... deployment code ...
} catch (error) {
  console.error(error);
}
```

## 🚀 Testing the New System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Create a Test Deployment
```bash
# Via API or UI
POST /api/deploy/start
{
  "repositoryUrl": "https://github.com/user/repo",
  "deploymentService": "aws"
}
```

### 3. Verify Data Stored
```bash
# Check in MongoDB
db.deployments.findOne({}).pretty()
db.auditLogs.find({}).limit(5).pretty()
```

### 4. Verify Logs Have:
- ✅ `logs[]` array with messages
- ✅ `awsLogs[]` if AWS deployment
- ✅ `azureLogs[]` if Azure deployment
- ✅ `phaseMetrics` with timing
- ✅ `requestContext` with IP/UserAgent
- ✅ `deploymentVersion` (optimistic locking)

### 5. Verify Audit Trail:
```bash
db.auditLogs.find({ entityType: 'deployment' }).count()
```

Should see entries for:
- `created` - deployment created
- `status_changed` - each status update
- `error_occurred` - if any errors
- `log_added` - for important log entries

## 📋 Weekly Maintenance Checklist

Add to your deployment/CI pipeline:

```bash
# Weekly on Sunday at 2 AM
# crontab: 0 2 * * 0

cd /path/to/CloudOps/backend

# Validate all deployments
node scripts/maintainDatabase.js --validate-all

# Repair any issues
node scripts/maintainDatabase.js --repair

# Archive old deployments
node scripts/maintainDatabase.js --days=90 --cleanup-logs

# Log results
echo "Database maintenance completed at $(date)" >> logs/maintenance.log
```

## ⚠️ Important Notes

1. **TTL Index**: Audit logs auto-expire after 90 days
2. **Optimistic Locking**: `deploymentVersion` prevents race conditions
3. **Backward Compatible**: Old logging methods still work, but new ones are preferred
4. **No Data Loss**: All deployments retained (audit logs auto-archive)
5. **Request Context**: IP and User Agent captured for security audit

## 🎯 Expected Outcomes

After full implementation:
- ✅ 100% of deployments have complete audit trail
- ✅ All phase timing recorded
- ✅ Zero data loss on concurrent deployments
- ✅ Full request traceability
- ✅ Monthly performance reports possible
- ✅ Production-grade compliance audit trail

## 📚 Documentation

- **Full Guide**: [MONGODB_IMPLEMENTATION.md](./MONGODB_IMPLEMENTATION.md)
- **Quick Start**: [MONGODB_QUICK_START.md](./MONGODB_QUICK_START.md)

## 🆘 Troubleshooting

**Issue**: Services not using EnhancedLogger yet
**Action**: See "Services to Update" section above

**Issue**: Deployment data missing fields
**Action**: Run `maintainDatabase.js --validate-all --repair`

**Issue**: MongoDB connection issues
**Action**: Check `.env` `MONGODB_URI` and IP whitelist in MongoDB Atlas

---

**Status**: ✅ Ready for deployment and gradual service migration
