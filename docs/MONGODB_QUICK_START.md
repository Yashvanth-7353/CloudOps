# MongoDB Setup Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Ensure MongoDB Connection (Already Set)
```bash
# Verify .env has MONGODB_URI set
cat backend/.env | grep MONGODB_URI
```

### 2. Initialize Database (One-time)
```bash
# Install yargs if not already installed (used by maintenance script)
npm install --save-dev yargs

# Run initialization
cd backend
node scripts/initializeDatabase.js

# Expected output:
# ✅ MongoDB connected successfully!
# ✅ All indexes created successfully
# ✅ Database initialization complete!
```

### 3. Start Using Enhanced Logging

Replace any deployment code that uses:
```javascript
// OLD WAY
const Deployment = require('./models/Deployment');
await Deployment.findByIdAndUpdate(deploymentId, {
  $push: { logs: { message: 'Test', level: 'info' } }
});

// NEW WAY
const { EnhancedLogger } = require('./utils/deploymentPersistence');
await EnhancedLogger.addDeploymentLog(deploymentId, {
  source: 'system',
  level: 'info',
  message: 'Test'
});
```

### 4. Set Up Weekly Maintenance (Recommended)

Add to your deployment/CI:
```bash
# Weekly on Sunday at 2 AM
# In crontab: 0 2 * * 0 cd /path/to/CloudOps && node backend/scripts/maintainDatabase.js --days=90 --cleanup-logs
```

Or run manually:
```bash
node backend/scripts/maintainDatabase.js --days=90 --cleanup-logs
```

## 📊 Key Features Available Now

### Audit Logging (All Changes Tracked)
```javascript
// Every deployment status change is audited
// View audit trail:
db.auditLogs.find({ 
  entityType: 'deployment', 
  entityId: ObjectId('...') 
}).sort({ timestamp: -1 })
```

### Performance Metrics (Phase Timing)
```javascript
// View deployment timing breakdown
db.deployments.findOne({ _id: ObjectId('...') }, {
  'phaseMetrics': 1
})

// Output:
// {
//   phaseMetrics: {
//     cloneDuration: 5234,      // ms
//     detectDuration: 1203,
//     buildDuration: 45123,
//     pushDuration: 12034,
//     deployDuration: 8934,
//     totalDuration: 72528
//   }
// }
```

### Data Integrity Validation
```javascript
// Check if deployment data is valid
const { validateDeploymentIntegrity } = require('./utils/databaseUtilities');
const result = await validateDeploymentIntegrity(deploymentId);
console.log(result);
// { valid: true, issues: [], deployment: {...} }
```

### Safe Infrastructure Updates
```javascript
// No more partial overwrites!
const { updateInfrastructure } = require('./utils/databaseUtilities');
await updateInfrastructure(deploymentId, 'ec2', {
  instanceId: 'i-123456',
  publicIp: '1.2.3.4',
  status: 'running'
});
```

## 🔍 Monitoring Your Deployments

### View Recent Deployments with Full Context
```bash
# In MongoDB shell
use cloudops
db.deployments.find({}).sort({ createdAt: -1 }).limit(5).pretty()
```

### Check Deployment Status Breakdown
```bash
db.deployments.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).pretty()
```

### View User's Audit Trail
```bash
db.auditLogs.find({ userId: 'user@example.com' }).sort({ timestamp: -1 }).limit(20).pretty()
```

## 📦 What Changed in Database

### New Collections
- `auditLogs` - Tracks all changes to deployments

### New Fields in Deployments
```
✅ deploymentVersion (for optimistic locking)
✅ requestContext (IP, User Agent, Request ID for correlation)
✅ phaseMetrics (timing breakdown for each phase)
✅ archived (flag for data archival)
✅ archivedAt (timestamp of archival)
✅ redeploys (track redeploy history)
✅ healthCheckHistory (health status over time)
```

### New Indexes
- Deployment: (userId, deploymentService, createdAt)
- Deployment: (status, healthStatus, createdAt)
- Deployment: (archived, createdAt)
- Deployment: (provider, createdAt)
- AuditLog: All query patterns indexed for fast lookup

## 🛠️ Troubleshooting

### Issue: "Connection refused"
```bash
# Check MongoDB is running
# For local: mongod should be running
# For cloud: Check connection string and IP whitelist in MongoDB Atlas
```

### Issue: "Indexes already exist"
That's fine! The script will skip them.

### Issue: "Collection doesn't exist"
Also fine! MongoDB creates collections on first write.

### Issue: Deployment data missing after restart
Run data repair:
```bash
node backend/scripts/maintainDatabase.js --repair --dry-run
# Review what would be fixed, then run without --dry-run
```

## 📝 Next Steps

1. ✅ Database initialized
2. ✅ All indexes created
3. Run your first deployment and verify:
   ```bash
   # After deployment completes, check:
   db.deployments.findOne(
     { _id: ObjectId('...') },
     { status: 1, 'phaseMetrics': 1, logs: { $slice: -5 } }
   )
   ```

4. Set up maintenance cron job
5. Monitor logs using `db.deployments.find({}).sort({createdAt:-1}).limit(10)`

## 📚 Full Documentation

See [MONGODB_IMPLEMENTATION.md](./MONGODB_IMPLEMENTATION.md) for:
- Complete API reference
- Data flow examples
- Advanced configuration
- Performance tuning
- Compliance guidelines
- Troubleshooting deep-dives

## 🎯 Success Criteria

After setup, you should see:
- ✅ Deployments stored with all fields populated
- ✅ Audit logs created for every deployment
- ✅ Phase timing recorded (cloneDuration, buildDuration, etc.)
- ✅ Error details captured with full stack traces
- ✅ Request context (IP, User Agent) stored
- ✅ All logs sanitized (secrets redacted)
- ✅ Health status tracked
- ✅ Redeploy history maintained

---

**Questions?** Check the logs in MongoDB Atlas or application logs for detailed error messages.
