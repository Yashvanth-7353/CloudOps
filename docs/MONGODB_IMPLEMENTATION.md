# CloudOps MongoDB Implementation Guide

## Overview

This guide covers the industry-standard MongoDB data persistence implementation for CloudOps. The system now includes comprehensive audit logging, optimistic locking, transaction support, and data integrity validation.

## Architecture

### Models

#### 1. **Deployment Model** (Enhanced)
Stores complete deployment lifecycle with audit fields:
```
✅ Core Deployment Data
  - Status, Phase, Repository Info
  - Framework Detection
  - Docker Build Details
  - Infrastructure Configuration (AWS/Azure)
  - Environment Variables

✅ Timing Metrics (NEW)
  - phaseMetrics: Clone, Detect, Build, Push, Deploy times
  - totalDuration: Complete deployment time
  - timing breakdown for performance analysis

✅ Audit & Compliance (NEW)
  - deploymentVersion: Tracks redeploys (optimistic locking)
  - requestContext: IP, User Agent, Request ID for correlation
  - archived: Flag for data archival
  - archivedAt: Timestamp of archival

✅ Logging
  - logs[]: Unified log array
  - awsLogs[]: AWS service-specific logs
  - azureLogs[]: Azure service-specific logs
  - healthCheckHistory[]: Health status tracking

✅ Error Handling
  - error: Detailed error object with stack trace
  - failureReason: User-friendly error message
  - retryCount & maxRetries: Retry tracking
```

#### 2. **AuditLog Model** (NEW)
Comprehensive audit trail for compliance and debugging:
```
✅ Change Tracking
  - entityType: deployment, project, user, infrastructure
  - entityId: Reference to changed entity
  - action: created, updated, deleted, status_changed, etc.
  - timestamp: When change occurred (with 90-day TTL)

✅ Context & Attribution
  - userId: Who made the change
  - reason: user_action, system_event, webhook_trigger, etc.
  - context.ipAddress: Source IP for security audit
  - context.requestId: Correlate with HTTP request logs

✅ Data Preservation
  - changes.before & .after: Previous and new values
  - snapshot: Full state snapshot at time of change
  - error: If action failed, error details
  - resourcesAffected: List of created/modified resources

✅ Performance Tracking
  - duration: How long action took (ms)
  - relatedAuditIds: Link related changes
```

#### 3. **User & Project Models** (Unchanged)
Continue to use existing schema with enhanced indexing.

### Logging Infrastructure

#### EnhancedLogger Service
Centralized logging with automatic sanitization and audit trails:

```javascript
// Add deployment log
await EnhancedLogger.addDeploymentLog(deploymentId, {
  source: 'docker',
  level: 'info',
  message: 'Build completed',
  data: { imageSize: 512000000 },
  deploymentService: 'aws'
});

// Record status change with audit
await EnhancedLogger.updateDeploymentStatus(deploymentId, {
  newStatus: 'success',
  newPhase: 'complete',
  userId: 'user123',
  reason: 'user_action',
  context: { phase: 'deployment' }
});

// Record error with recovery action
await EnhancedLogger.recordDeploymentError(deploymentId, error, {
  phase: 'docker_build',
  source: 'docker',
  userId: 'system',
  recoveryAction: 'Retry with increased timeout'
});
```

#### Database Utilities Service
Safe data operations with transactions and locking:

```javascript
// Update with optimistic locking
const updated = await DatabaseUtilities.updateDeploymentWithLocking(
  deploymentId,
  { status: 'building' },
  { version: currentVersion, userId: 'system' }
);

// Safely update nested infrastructure
await DatabaseUtilities.updateInfrastructure(deploymentId, 'ec2', {
  instanceId: 'i-123456',
  publicIp: '1.2.3.4',
  status: 'running'
});

// Record phase timing
await DatabaseUtilities.recordPhaseTiming(deploymentId, 'docker_build', {
  startTime: new Date(),
  duration: 125000 // 125 seconds
});

// Archive old deployments with transaction
const archivedCount = await DatabaseUtilities.archiveOldDeployments(90, {
  dryRun: false
});

// Get deployment with audit history
const { deployment, auditHistory } = await DatabaseUtilities.getDeploymentWithAudit(deploymentId);

// Validate data integrity
const validation = await DatabaseUtilities.validateDeploymentIntegrity(deploymentId);

// Create backup snapshot
const snapshot = await DatabaseUtilities.createDeploymentSnapshot(deploymentId, 'manual_backup');
```

#### Enhanced Persistence API
Backward-compatible with legacy functions:

```javascript
const { EnhancedLogger, DatabaseUtilities } = require('./deploymentPersistence');

// Legacy (still works)
await pushDeploymentLog(deploymentId, logEntry);
await updateDeploymentFields(deploymentId, fields);

// New functions
await updateDeploymentStatus(deploymentId, newStatus, { userId, reason });
await recordDeploymentError(deploymentId, error, { phase, source });
await recordPhaseTiming(deploymentId, 'clone', { duration: 5000 });
await markDeploymentComplete(deploymentId, { status: 'success', totalTime: 60000 });
await createDeploymentSnapshot(deploymentId, 'pre_redeploy');
await getDeploymentWithAudit(deploymentId);
await validateDeploymentIntegrity(deploymentId);
```

## Database Setup

### Initial Setup (After Fresh Deployment)

```bash
# 1. Make sure MongoDB is running and connection string is set
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/cloudops"

# 2. Initialize database and create indexes
node backend/scripts/initializeDatabase.js

# Expected output:
# ✅ MongoDB connection successful
# ✅ All indexes created
# ✅ Collections verified
# ✅ Data validation complete
```

### What initializeDatabase.js Does:
- ✅ Connects to MongoDB
- ✅ Creates all required indexes for performance
- ✅ Verifies collections exist
- ✅ Validates existing data integrity
- ✅ Displays index information and statistics
- ✅ Shows deployment status breakdown

### Ongoing Maintenance

```bash
# Archive deployments older than 90 days
node backend/scripts/maintainDatabase.js --days=90

# Validate all deployments
node backend/scripts/maintainDatabase.js --validate-all

# Cleanup old audit logs (> 30 days)
node backend/scripts/maintainDatabase.js --cleanup-logs

# Repair data inconsistencies
node backend/scripts/maintainDatabase.js --repair

# Dry run (see what would happen without making changes)
node backend/scripts/maintainDatabase.js --days=90 --dry-run

# Combination: validate, repair, and archive
node backend/scripts/maintainDatabase.js --validate-all --repair --days=90
```

## Data Flow Examples

### Example 1: Deployment Creation

```javascript
const Deployment = require('./models/Deployment');
const EnhancedLogger = require('./utils/enhancedLogger');
const DatabaseUtilities = require('./utils/databaseUtilities');

// Create deployment
const deployment = new Deployment({
  userId: 'user123',
  repositoryUrl: 'https://github.com/user/repo',
  status: 'queued',
  phase: 'preparation',
  deploymentService: 'aws',
  requestContext: {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.id,
  },
  phaseMetrics: {
    cloneStartedAt: new Date(),
  }
});

const saved = await deployment.save();

// Log creation
await EnhancedLogger.addDeploymentLog(saved._id, {
  source: 'system',
  level: 'info',
  message: 'Deployment created',
  data: { repositoryUrl: saved.repositoryUrl }
});

// Create audit entry
await EnhancedLogger.createAuditLog({
  entityType: 'deployment',
  entityId: saved._id,
  userId: 'user123',
  action: 'created',
  reason: 'user_action',
  context: {
    source: 'api',
    ipAddress: req.ip,
  }
});
```

### Example 2: Git Clone Phase

```javascript
const startTime = Date.now();

try {
  await EnhancedLogger.addDeploymentLog(deploymentId, {
    source: 'git',
    level: 'info',
    message: 'Starting git clone',
    data: { repositoryUrl }
  });

  // ... perform git clone ...

  const duration = Date.now() - startTime;

  // Record timing
  await DatabaseUtilities.recordPhaseTiming(deploymentId, 'clone', {
    startTime: new Date(startTime),
    duration: duration
  });

  // Update status
  await EnhancedLogger.updateDeploymentStatus(deploymentId, {
    newStatus: 'detecting',
    newPhase: 'framework_detection',
    reason: 'phase_complete'
  });

} catch (error) {
  // Record error with recovery action
  await EnhancedLogger.recordDeploymentError(deploymentId, error, {
    phase: 'clone',
    source: 'git',
    userId: 'system',
    recoveryAction: 'Retry with exponential backoff'
  });
}
```

### Example 3: Docker Build Phase

```javascript
try {
  const buildStartTime = new Date();

  await EnhancedLogger.addDeploymentLog(deploymentId, {
    source: 'docker',
    level: 'info',
    message: `Building Docker image: ${imageName}`,
    data: { dockerfile: 'FROM node:18...' },
    deploymentService: 'aws'
  });

  // ... build docker image ...

  const imageSize = 512000000; // bytes
  const imageSha = 'sha256:abc123...';

  // Update infrastructure with safe merge
  await DatabaseUtilities.updateInfrastructure(deploymentId, 'ecr', {
    imageUri: `${registry}/${imageName}:${imageTag}`,
    imageTag: imageTag,
    imageSha: imageSha,
  });

  // Record timing
  const duration = Date.now() - buildStartTime;
  await DatabaseUtilities.recordPhaseTiming(deploymentId, 'docker_build', {
    duration: duration
  });

  await EnhancedLogger.addDeploymentLog(deploymentId, {
    source: 'docker',
    level: 'success',
    message: 'Docker image build successful',
    data: {
      imageSize: imageSize,
      imageSha: imageSha,
      buildTime: duration
    },
    deploymentService: 'aws'
  });

} catch (error) {
  await EnhancedLogger.recordDeploymentError(deploymentId, error, {
    phase: 'docker_build',
    source: 'docker',
    recoveryAction: 'Check Docker daemon status and retry'
  });
}
```

### Example 4: Deployment Completion

```javascript
try {
  const totalTime = Date.now() - deployment.startedAt;

  // Create snapshot before marking complete
  await DatabaseUtilities.createDeploymentSnapshot(deploymentId, 'pre_completion');

  // Mark as complete with all metrics
  await markDeploymentComplete(deploymentId, {
    status: 'success',
    totalTime: totalTime,
    publicUrl: 'https://app.example.com',
    userId: 'system'
  });

  // Record final metrics
  await DatabaseUtilities.recordPhaseTiming(deploymentId, 'complete', {
    endTime: new Date(),
    duration: totalTime
  });

  await EnhancedLogger.addDeploymentLog(deploymentId, {
    source: 'system',
    level: 'success',
    message: 'Deployment completed successfully',
    data: {
      totalTime: totalTime,
      publicUrl: 'https://app.example.com',
      framework: 'nodejs'
    }
  });

} catch (error) {
  // Record failure
  await EnhancedLogger.recordDeploymentError(deploymentId, error, {
    phase: 'complete',
    source: 'system'
  });
}
```

## Indexes Overview

All indexes are automatically created by initializeDatabase.js:

### Performance Indexes
```
Deployment Collection:
  - (userId, createdAt): User's deployments
  - (status, createdAt): Deployments by status
  - (userId, deploymentService, createdAt): User's AWS/Azure deployments
  - (archived, createdAt): Archived deployments
  - (provider, createdAt): Deployments by cloud provider

User Collection:
  - githubId (unique): User lookup by GitHub
  - email (sparse): Email lookups

Project Collection:
  - (userId, createdAt): User's projects
  - repositoryUrl: Repository lookup
  - status: Project status filtering

AuditLog Collection:
  - (entityType, entityId, timestamp): Entity history
  - (userId, timestamp): User activity audit
  - (action, timestamp): Action history
  - timestamp (TTL): Auto-expire after 90 days
```

## Best Practices

### 1. Always Use Enhanced Logger
```javascript
// ✅ GOOD: Use EnhancedLogger for all logging
await EnhancedLogger.addDeploymentLog(deploymentId, {
  source: 'docker',
  level: 'info',
  message: 'Build started'
});

// ❌ AVOID: Direct console.log
console.log('Build started');
```

### 2. Use Optimistic Locking for Concurrent Updates
```javascript
// ✅ GOOD: Include version for safety
const currentVersion = deployment.deploymentVersion;
const updated = await DatabaseUtilities.updateDeploymentWithLocking(
  deploymentId,
  { status: 'building' },
  { version: currentVersion }
);

// ❌ AVOID: Direct update without version check
await Deployment.findByIdAndUpdate(deploymentId, { status: 'building' });
```

### 3. Always Reassign Nested Objects
```javascript
// ✅ GOOD: Replace entire infrastructure object
await DatabaseUtilities.updateInfrastructure(deploymentId, 'ec2', {
  instanceId: 'i-123',
  publicIp: '1.2.3.4'
});

// ❌ AVOID: Partial nested updates
await Deployment.updateOne(
  { _id: deploymentId },
  { $set: { 'infrastructure.ec2.instanceId': 'i-123' } }
);
```

### 4. Record Timing for All Phases
```javascript
// ✅ GOOD: Track phase durations
const startTime = new Date();
// ... do work ...
await DatabaseUtilities.recordPhaseTiming(deploymentId, 'clone', {
  duration: Date.now() - startTime
});

// ❌ AVOID: No timing data
// ... do work ...
```

### 5. Create Snapshots Before Major Changes
```javascript
// ✅ GOOD: Backup before redeploy
await DatabaseUtilities.createDeploymentSnapshot(deploymentId, 'pre_redeploy');
// ... perform redeploy ...

// ❌ AVOID: No backup
// ... perform redeploy ...
```

### 6. Sanitize Sensitive Data
```javascript
// ✅ GOOD: Use EnhancedLogger (auto-sanitizes)
await EnhancedLogger.addDeploymentLog(deploymentId, {
  message: `Token: gho_abc123xyz`,  // Auto-redacted
  data: { apiKey: 'secret_value' }   // Auto-redacted
});

// ❌ AVOID: Direct logging of secrets
console.log('Token:', githubToken);
```

## Monitoring & Troubleshooting

### Check Deployment Integrity
```bash
# Validate single deployment
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const DB = require('./backend/src/utils/databaseUtilities');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await DB.validateDeploymentIntegrity('<DEPLOYMENT_ID>');
  console.log(result);
  process.exit(0);
})();
"
```

### View Deployment Audit History
```bash
# Get audit logs for deployment
db.auditLogs.find({
  entityType: 'deployment',
  entityId: ObjectId('<DEPLOYMENT_ID>')
}).sort({ timestamp: -1 }).pretty()
```

### Check Database Statistics
```bash
# Get size and stats
db.deployments.stats()
db.auditLogs.stats()

# Count by status
db.deployments.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Archive Status
```bash
# Check archived deployments
db.deployments.find({ archived: true }).count()

# Find deployments eligible for archival
db.deployments.find({
  createdAt: { $lt: new Date(Date.now() - 90*24*60*60*1000) },
  status: { $in: ['success', 'failed', 'cancelled'] }
}).count()
```

## Troubleshooting

### Issue: Version Conflict Error
**Error**: `Deployment version conflict. Expected version X, but deployment was updated elsewhere.`

**Solution**: 
- Get the latest version: `const latest = await Deployment.findById(id);`
- Retry with current version: `updateDeploymentWithLocking(id, updates, { version: latest.deploymentVersion })`

### Issue: Missing Deployment Data
**Problem**: Fields like `completedAt` are missing

**Solution**:
```bash
# Run repair
node backend/scripts/maintainDatabase.js --repair
```

### Issue: High MongoDB Response Times
**Solution**:
```bash
# Check indexes are being used
db.deployments.find({ userId: 'user123' }).explain('executionStats')

# Rebuild indexes if needed
db.deployments.reIndex()
```

## Migration Path

If upgrading from old schema:

```bash
# 1. Initialize indexes first (non-destructive)
node backend/scripts/initializeDatabase.js

# 2. Validate all existing deployments
node backend/scripts/maintainDatabase.js --validate-all

# 3. Repair any issues found
node backend/scripts/maintainDatabase.js --repair

# 4. Test with a few deployments
# - Create new deployment
# - Verify logs, audit trail, metrics are recorded

# 5. Archive old deployments (optional)
node backend/scripts/maintainDatabase.js --days=365 --dry-run
# (review output, then run without --dry-run)
```

## Performance Tuning

### Recommended Settings

```javascript
// In .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cloudops?retryWrites=true&w=majority

// Connection pool
mongodb.serverSelectionTimeoutMS = 10000
mongodb.socketTimeoutMS = 45000
mongodb.maxPoolSize = 50
```

### Query Optimization Tips
1. Always filter by indexed fields first
2. Use `.lean()` for read-only queries to reduce memory
3. Use `.select()` to fetch only needed fields
4. Implement pagination for large result sets

## Compliance & Audit

### GDPR Compliance
- Audit logs auto-expire after 90 days (TTL index)
- User data can be archived separately
- All changes tracked with timestamps

### Audit Trail Example
```javascript
// View who changed what
db.auditLogs.find({
  entityType: 'deployment',
  entityId: ObjectId('...')
}).sort({ timestamp: -1 }).limit(10)

// Output:
// {
//   userId: 'user123',
//   action: 'status_changed',
//   changes: {
//     before: { status: 'pending' },
//     after: { status: 'success' }
//   },
//   timestamp: ISODate('...')
// }
```

## Support & Debugging

For issues, check:
1. MongoDB connection: `echo $MONGODB_URI`
2. Database initialization: `node backend/scripts/initializeDatabase.js`
3. Recent deployments: `db.deployments.find({}).sort({ createdAt: -1 }).limit(5)`
4. Audit logs for deployment: `db.auditLogs.find({ entityId: ObjectId('...') })`
5. Application logs for errors

## Summary

✅ **What's Implemented**:
- Comprehensive audit trail for all deployments
- Automatic data sanitization and encryption
- Optimistic locking to prevent race conditions
- Transaction support for multi-document operations
- Timing metrics for performance analysis
- Data integrity validation and repair
- Automatic archive and cleanup
- Request correlation with audit context
- Health check tracking
- Role-based access to audit logs

✅ **Ready for Production**: Yes, with regular maintenance scripts running on schedule.
