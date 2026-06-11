#!/usr/bin/env node
/**
 * Data Archive and Maintenance Script
 * Archives old deployments, validates data integrity, and performs cleanup
 * 
 * Usage: node backend/scripts/maintainDatabase.js [--days=90] [--dry-run] [--validate-all]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DatabaseUtilities = require('../src/utils/databaseUtilities');

// Import models
const Deployment = require('../src/models/Deployment');
const AuditLog = require('../src/models/AuditLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudops';

// Parse command line arguments
const args = require('yargs')
  .option('days', {
    alias: 'd',
    describe: 'Archive deployments older than N days',
    type: 'number',
    default: 90,
  })
  .option('dry-run', {
    describe: 'Simulate archival without making changes',
    type: 'boolean',
    default: false,
  })
  .option('validate-all', {
    describe: 'Validate integrity of all deployments',
    type: 'boolean',
    default: false,
  })
  .option('cleanup-logs', {
    describe: 'Clean up old audit logs',
    type: 'boolean',
    default: false,
  })
  .option('repair', {
    describe: 'Attempt to repair data inconsistencies',
    type: 'boolean',
    default: false,
  })
  .argv;

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    process.exit(1);
  }
}

/**
 * Archive old deployments
 */
async function archiveOldDeployments() {
  try {
    console.log(`\n📦 Archiving deployments older than ${args.days} days...`);

    const count = await DatabaseUtilities.archiveOldDeployments(args.days, {
      dryRun: args.dryRun,
    });

    console.log(`${args.dryRun ? '✓ Would archive' : '✅ Archived'} ${count} deployments`);

    return count;
  } catch (error) {
    console.error('❌ Error archiving deployments:', error.message);
    throw error;
  }
}

/**
 * Validate all deployments
 */
async function validateAllDeployments() {
  try {
    console.log('\n🔍 Validating all deployments...');

    const deployments = await Deployment.find({}).select('_id').lean();
    console.log(`Found ${deployments.length} deployments to validate`);

    let issueCount = 0;
    const issues = [];

    for (let i = 0; i < deployments.length; i++) {
      const validation = await DatabaseUtilities.validateDeploymentIntegrity(deployments[i]._id);

      if (!validation.valid) {
        issueCount += validation.issues.length;
        issues.push({
          deploymentId: deployments[i]._id,
          issues: validation.issues,
        });
      }

      // Progress indicator
      if ((i + 1) % 100 === 0) {
        console.log(`  Validated ${i + 1}/${deployments.length}`);
      }
    }

    if (issues.length > 0) {
      console.log(`\n⚠️  Found ${issueCount} issues in ${issues.length} deployments:`);
      for (const issue of issues.slice(0, 10)) {
        console.log(`  Deployment ${issue.deploymentId}:`);
        for (const i of issue.issues) {
          console.log(`    - ${i}`);
        }
      }

      if (issues.length > 10) {
        console.log(`  ... and ${issues.length - 10} more deployments with issues`);
      }
    } else {
      console.log('✅ All deployments are valid');
    }

    return { totalDeployments: deployments.length, issueCount, issues };
  } catch (error) {
    console.error('❌ Error validating deployments:', error.message);
    throw error;
  }
}

/**
 * Cleanup old audit logs
 */
async function cleanupOldAuditLogs() {
  try {
    console.log('\n🗑️ Cleaning up old audit logs...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (args.dryRun) {
      const count = await AuditLog.countDocuments({
        timestamp: { $lt: thirtyDaysAgo },
      });

      console.log(`✓ Would delete ${count} audit logs older than 30 days`);
      return count;
    }

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: thirtyDaysAgo },
    });

    console.log(`✅ Deleted ${result.deletedCount} audit logs older than 30 days`);

    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning audit logs:', error.message);
    throw error;
  }
}

/**
 * Repair data inconsistencies
 */
async function repairDataInconsistencies() {
  try {
    console.log('\n🔧 Repairing data inconsistencies...');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let repaired = 0;

      // Fix successful deployments without completedAt
      const successNoCompleted = await Deployment.find(
        {
          status: 'success',
          completedAt: { $exists: false },
        },
        { _id: 1 },
        { session }
      );

      if (successNoCompleted.length > 0) {
        if (!args.dryRun) {
          await Deployment.updateMany(
            {
              status: 'success',
              completedAt: { $exists: false },
            },
            {
              $set: {
                completedAt: new Date(),
                phase: 'complete',
              },
            },
            { session }
          );
        }

        console.log(`${args.dryRun ? '✓ Would repair' : '✅ Repaired'} ${successNoCompleted.length} successful deployments missing completedAt`);
        repaired += successNoCompleted.length;
      }

      // Fix failed deployments with wrong healthStatus
      const failedBadHealth = await Deployment.find(
        {
          status: 'failed',
          healthStatus: { $ne: 'unhealthy' },
        },
        { _id: 1 },
        { session }
      );

      if (failedBadHealth.length > 0) {
        if (!args.dryRun) {
          await Deployment.updateMany(
            {
              status: 'failed',
              healthStatus: { $ne: 'unhealthy' },
            },
            {
              $set: { healthStatus: 'unhealthy' },
            },
            { session }
          );
        }

        console.log(`${args.dryRun ? '✓ Would repair' : '✅ Repaired'} ${failedBadHealth.length} failed deployments with incorrect healthStatus`);
        repaired += failedBadHealth.length;
      }

      // Fix deployments with invalid retry counts
      const badRetryCount = await Deployment.find(
        {
          retryCount: { $gt: 10 },
        },
        { _id: 1 },
        { session }
      );

      if (badRetryCount.length > 0) {
        if (!args.dryRun) {
          await Deployment.updateMany(
            {
              retryCount: { $gt: 10 },
            },
            {
              $set: { retryCount: 10 },
            },
            { session }
          );
        }

        console.log(`${args.dryRun ? '✓ Would repair' : '✅ Repaired'} ${badRetryCount.length} deployments with excessive retry counts`);
        repaired += badRetryCount.length;
      }

      if (args.dryRun) {
        await session.abortTransaction();
      } else {
        await session.commitTransaction();
      }

      console.log(`\n${args.dryRun ? '✓ Dry run complete' : '✅ Repairs complete'}: ${repaired} records would be/were updated`);

      return repaired;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('❌ Error repairing data:', error.message);
    throw error;
  }
}

/**
 * Display database statistics
 */
async function displayStatistics() {
  try {
    console.log('\n📊 Database Statistics:');

    const [deploymentCount, archivedCount, activeCount, auditLogCount] = await Promise.all([
      Deployment.countDocuments({}),
      Deployment.countDocuments({ archived: true }),
      Deployment.countDocuments({ archived: false }),
      AuditLog.countDocuments({}),
    ]);

    console.log(`  Total Deployments: ${deploymentCount}`);
    console.log(`  Archived: ${archivedCount}`);
    console.log(`  Active: ${activeCount}`);
    console.log(`  Audit Logs: ${auditLogCount}`);

    // Size information
    const db = mongoose.connection.db;
    const deploymentStats = await db.collection('deployments').stats();
    const auditStats = await db.collection('auditLogs').stats();

    console.log(`\n  Storage Size:`);
    console.log(`  Deployments: ${(deploymentStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Audit Logs: ${(auditStats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
  }
}

/**
 * Main maintenance function
 */
async function runMaintenance() {
  try {
    console.log('🔧 CloudOps Database Maintenance\n');
    console.log(`📍 MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);

    if (args.dryRun) {
      console.log('⚠️  Running in DRY-RUN mode (no changes will be made)\n');
    }

    await connectDatabase();

    // Run requested tasks
    if (args.days) {
      await archiveOldDeployments();
    }

    if (args.validateAll) {
      await validateAllDeployments();
    }

    if (args.cleanupLogs) {
      await cleanupOldAuditLogs();
    }

    if (args.repair) {
      await repairDataInconsistencies();
    }

    await displayStatistics();

    console.log('\n✅ Maintenance complete!');
  } catch (error) {
    console.error('\n❌ Maintenance failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run maintenance
if (require.main === module) {
  runMaintenance();
}

module.exports = { archiveOldDeployments, validateAllDeployments, cleanupOldAuditLogs, repairDataInconsistencies };
