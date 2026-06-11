#!/usr/bin/env node
/**
 * Database Initialization Script
 * Sets up indexes, validates collections, and prepares database for production use
 * Run this after fresh deployment or when upgrading MongoDB schema
 * 
 * Usage: node backend/scripts/initializeDatabase.js
 * Usage with specific env: MONGODB_URI=... node backend/scripts/initializeDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Deployment = require('../src/models/Deployment');
const AuditLog = require('../src/models/AuditLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudops';

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

/**
 * Create indexes for all models
 */
async function createIndexes() {
  try {
    console.log('\n📊 Creating indexes...');

    // Helper function to create index with error handling
    const createIndexSafely = async (collection, spec, options, name) => {
      try {
        await collection.createIndex(spec, options);
      } catch (error) {
        // Ignore duplicate index errors - they're already created
        if (error.code === 86 || error.codeName === 'IndexKeySpecsConflict') {
          console.log(`  ℹ️  Index already exists: ${name || JSON.stringify(spec)}`);
        } else if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
          console.log(`  ℹ️  Index exists with different options (may need manual update): ${name || JSON.stringify(spec)}`);
        } else {
          throw error;
        }
      }
    };

    // User indexes
    console.log('Creating User indexes...');
    await createIndexSafely(User.collection, { githubId: 1 }, { unique: true }, 'User.githubId');
    await createIndexSafely(User.collection, { email: 1 }, { sparse: true }, 'User.email');
    await createIndexSafely(User.collection, { createdAt: -1 }, {}, 'User.createdAt');

    // Project indexes
    console.log('Creating Project indexes...');
    await createIndexSafely(Project.collection, { userId: 1, createdAt: -1 }, {}, 'Project.(userId,createdAt)');
    await createIndexSafely(Project.collection, { repositoryUrl: 1 }, {}, 'Project.repositoryUrl');
    await createIndexSafely(Project.collection, { status: 1 }, {}, 'Project.status');
    await createIndexSafely(Project.collection, { githubWebhookId: 1 }, { sparse: true }, 'Project.githubWebhookId');

    // Deployment indexes (critical for performance)
    console.log('Creating Deployment indexes...');
    await createIndexSafely(Deployment.collection, { projectId: 1, createdAt: -1 }, {}, 'Deployment.(projectId,createdAt)');
    await createIndexSafely(Deployment.collection, { userId: 1, createdAt: -1 }, {}, 'Deployment.(userId,createdAt)');
    await createIndexSafely(Deployment.collection, { status: 1, createdAt: -1 }, {}, 'Deployment.(status,createdAt)');
    await createIndexSafely(Deployment.collection, { publicUrl: 1 }, { sparse: true }, 'Deployment.publicUrl');
    await createIndexSafely(Deployment.collection, { userId: 1, deploymentService: 1, createdAt: -1 }, {}, 'Deployment.(userId,deploymentService,createdAt)');
    await createIndexSafely(Deployment.collection, { status: 1, healthStatus: 1, createdAt: -1 }, {}, 'Deployment.(status,healthStatus,createdAt)');
    await createIndexSafely(Deployment.collection, { archived: 1, createdAt: -1 }, {}, 'Deployment.(archived,createdAt)');
    await createIndexSafely(Deployment.collection, { 'requestContext.requestId': 1 }, { sparse: true }, 'Deployment.requestContext.requestId');
    await createIndexSafely(Deployment.collection, { provider: 1, createdAt: -1 }, {}, 'Deployment.(provider,createdAt)');
    await createIndexSafely(Deployment.collection, { deploymentVersion: 1 }, {}, 'Deployment.deploymentVersion');

    // AuditLog indexes
    console.log('Creating AuditLog indexes...');
    await createIndexSafely(AuditLog.collection, { entityType: 1, entityId: 1, timestamp: -1 }, {}, 'AuditLog.(entityType,entityId,timestamp)');
    await createIndexSafely(AuditLog.collection, { userId: 1, timestamp: -1 }, {}, 'AuditLog.(userId,timestamp)');
    await createIndexSafely(AuditLog.collection, { action: 1, timestamp: -1 }, {}, 'AuditLog.(action,timestamp)');
    await createIndexSafely(AuditLog.collection, { 'context.requestId': 1 }, { sparse: true }, 'AuditLog.context.requestId');
    
    // TTL index: auto-delete after 90 days (7776000 seconds)
    // Drop existing TTL index if it exists without TTL option, then recreate with TTL
    try {
      await AuditLog.collection.dropIndex('timestamp_1');
      console.log('  ℹ️  Dropped existing timestamp index to recreate with TTL');
    } catch (e) {
      // Index doesn't exist, that's fine
    }
    
    try {
      await createIndexSafely(
        AuditLog.collection,
        { timestamp: 1 },
        { expireAfterSeconds: 7776000 },
        'AuditLog.timestamp (TTL 90 days)'
      );
    } catch (e) {
      // If TTL index fails, log but don't fail initialization
      console.log(`  ⚠️  Could not create TTL index (audit logs will persist longer than 90 days): ${e.message}`);
    }

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    throw error;
  }
}

/**
 * Verify collections exist and have proper structure
 */
async function verifyCollections() {
  try {
    console.log('\n🔍 Verifying collections...');

    const collections = ['users', 'projects', 'deployments', 'auditLogs'];
    const db = mongoose.connection.db;

    for (const collName of collections) {
      const exists = await db.listCollections({ name: collName }).toArray();
      if (exists.length > 0) {
        console.log(`  ✅ Collection '${collName}' exists`);
      } else {
        console.log(`  ⚠️  Collection '${collName}' does not exist (will be created on first write)`);
      }
    }
  } catch (error) {
    console.error('❌ Error verifying collections:', error.message);
    throw error;
  }
}

/**
 * Validate data integrity in existing deployments
 */
async function validateExistingData() {
  try {
    console.log('\n✔️ Validating existing data...');

    const deploymentCount = await Deployment.countDocuments();

    if (deploymentCount === 0) {
      console.log('  ℹ️  No deployments found (fresh database)');
      return;
    }

    console.log(`  Found ${deploymentCount} deployments, checking integrity...`);

    // Check for deployments without required fields
    const missingUserId = await Deployment.countDocuments({ userId: { $exists: false } });
    if (missingUserId > 0) {
      console.warn(`  ⚠️  ${missingUserId} deployments missing userId field`);
    }

    const missingStatus = await Deployment.countDocuments({ status: { $exists: false } });
    if (missingStatus > 0) {
      console.warn(`  ⚠️  ${missingStatus} deployments missing status field`);
    }

    // Check for success deployments without completedAt
    const successNoCompleted = await Deployment.countDocuments({
      status: 'success',
      completedAt: { $exists: false },
    });
    if (successNoCompleted > 0) {
      console.warn(`  ⚠️  ${successNoCompleted} successful deployments missing completedAt`);
    }

    console.log('  ✅ Data validation complete');
  } catch (error) {
    console.error('❌ Error validating data:', error.message);
    throw error;
  }
}

/**
 * Display index information
 */
async function displayIndexInfo() {
  try {
    console.log('\n📈 Index Information:');

    const collections = {
      'Users': User.collection,
      'Projects': Project.collection,
      'Deployments': Deployment.collection,
      'AuditLogs': AuditLog.collection,
    };

    for (const [name, collection] of Object.entries(collections)) {
      const indexes = await collection.getIndexes();
      console.log(`\n  ${name}:`);
      console.log(`    Total indexes: ${Object.keys(indexes).length}`);
      for (const [indexName, indexSpec] of Object.entries(indexes)) {
        if (indexName !== '_id_') {
          console.log(`    - ${indexName}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error displaying index info:', error.message);
    throw error;
  }
}

/**
 * Display statistics
 */
async function displayStatistics() {
  try {
    console.log('\n📊 Database Statistics:');

    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    const deploymentCount = await Deployment.countDocuments();
    const auditLogCount = await AuditLog.countDocuments();

    console.log(`  Users: ${userCount}`);
    console.log(`  Projects: ${projectCount}`);
    console.log(`  Deployments: ${deploymentCount}`);
    console.log(`  Audit Logs: ${auditLogCount}`);

    // Get deployment status breakdown
    const statusBreakdown = await Deployment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    if (statusBreakdown.length > 0) {
      console.log('\n  Deployment Status Breakdown:');
      for (const item of statusBreakdown) {
        console.log(`    ${item._id}: ${item.count}`);
      }
    }
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
    throw error;
  }
}

/**
 * Main initialization function
 */
async function initialize() {
  try {
    console.log('🚀 CloudOps Database Initialization\n');
    console.log(`📍 MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);

    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      process.exit(1);
    }

    // Run initialization tasks
    await verifyCollections();
    await createIndexes();
    await validateExistingData();
    await displayIndexInfo();
    await displayStatistics();

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify all indexes were created');
    console.log('   2. Check data validation results above');
    console.log('   3. Monitor application logs when starting');
    console.log('   4. Run periodic archive job for old deployments');
    console.log('   5. Monitor MongoDB performance and adjust indexes if needed\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

// Run initialization
if (require.main === module) {
  initialize();
}

module.exports = { createIndexes, verifyCollections, validateExistingData };
