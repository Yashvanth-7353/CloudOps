/**
 * Database Utilities and Transaction Helpers
 * Provides safe database operations with transaction support
 * Implements concurrency control and data validation
 */

const mongoose = require('mongoose');
const Deployment = require('../models/Deployment');
const AuditLog = require('../models/AuditLog');

class DatabaseUtilities {
  /**
   * Execute deployment update with optimistic locking
   * Prevents race conditions when multiple processes update the same deployment
   */
  static async updateDeploymentWithLocking(deploymentId, updates, { version = null, userId = 'system' } = {}) {
    try {
      const query = { _id: deploymentId };

      // Add version check for optimistic locking
      if (version !== null) {
        query.deploymentVersion = version;
      }

      const result = await Deployment.findOneAndUpdate(
        query,
        {
          ...updates,
          $inc: { deploymentVersion: 1 }, // Increment version
        },
        { new: true }
      );

      if (!result && version !== null) {
        throw new Error(`Deployment version conflict. Expected version ${version}, but deployment was updated elsewhere.`);
      }

      if (!result) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      return result;
    } catch (error) {
      console.error('[DBUtils] Error updating deployment with locking:', error.message);
      throw error;
    }
  }

  /**
   * Atomically update nested infrastructure fields
   * Always replace the entire nested object to prevent partial overwrites
   */
  static async updateInfrastructure(deploymentId, service, updates) {
    try {
      // Get current deployment to preserve other infrastructure data
      const deployment = await Deployment.findById(deploymentId);

      if (!deployment) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      // Merge updates into existing infrastructure
      const infrastructure = deployment.infrastructure || {};
      if (!infrastructure[service]) {
        infrastructure[service] = {};
      }

      // Always reassign the entire nested object
      infrastructure[service] = {
        ...infrastructure[service],
        ...updates,
      };

      // Update the deployment
      const updated = await Deployment.findByIdAndUpdate(
        deploymentId,
        { infrastructure: infrastructure },
        { new: true }
      );

      console.log(`[DBUtils] Updated infrastructure.${service} for deployment ${deploymentId}`);

      return updated;
    } catch (error) {
      console.error('[DBUtils] Error updating infrastructure:', error.message);
      throw error;
    }
  }

  /**
   * Safely merge metadata without overwriting existing values
   */
  static async updateMetadata(deploymentId, metadataUpdates) {
    try {
      const deployment = await Deployment.findById(deploymentId);

      if (!deployment) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      // Deep merge metadata
      const metadata = deployment.metadata || {};
      const merged = {
        ...metadata,
        ...metadataUpdates,
      };

      const updated = await Deployment.findByIdAndUpdate(
        deploymentId,
        { metadata: merged },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('[DBUtils] Error updating metadata:', error.message);
      throw error;
    }
  }

  /**
   * Record phase timing metrics atomically
   */
  static async recordPhaseTiming(deploymentId, phase, { startTime, endTime = null, duration = null }) {
    try {
      const phaseKey = `phaseMetrics.${phase}Duration`;
      const startKey = `phaseMetrics.${phase}StartedAt`;

      const updates = {};
      if (startTime) {
        updates[startKey] = startTime;
      }
      if (duration) {
        updates[phaseKey] = duration;
      }
      if (endTime) {
        updates[`phaseMetrics.${phase}EndedAt`] = endTime;
      }

      const updated = await Deployment.findByIdAndUpdate(
        deploymentId,
        { $set: updates },
        { new: true }
      );

      console.log(`[DBUtils] Recorded ${phase} timing for deployment ${deploymentId}`);

      return updated;
    } catch (error) {
      console.error('[DBUtils] Error recording phase timing:', error.message);
      throw error;
    }
  }

  /**
   * Bulk update deployments with transaction support
   * Ensures all-or-nothing semantics
   */
  static async bulkUpdateDeployments(deploymentIds, updates, { userId = 'system' } = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const results = [];

      for (const deploymentId of deploymentIds) {
        const result = await Deployment.findByIdAndUpdate(
          deploymentId,
          updates,
          { new: true, session }
        );

        if (result) {
          results.push(result);
        }
      }

      await session.commitTransaction();

      console.log(`[DBUtils] Bulk updated ${results.length} deployments`);

      return results;
    } catch (error) {
      await session.abortTransaction();
      console.error('[DBUtils] Error in bulk update:', error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Archive old deployments with transaction support
   * Marks deployments as archived and creates audit trail
   */
  static async archiveOldDeployments(olderThanDays = 90, { dryRun = false } = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const query = {
        createdAt: { $lt: cutoffDate },
        archived: false,
        status: { $in: ['success', 'failed', 'cancelled'] },
      };

      const deploymentsToArchive = await Deployment.find(query, { _id: 1 }, { session });

      if (dryRun) {
        console.log(`[DBUtils] DRY RUN: Would archive ${deploymentsToArchive.length} deployments older than ${olderThanDays} days`);
        await session.abortTransaction();
        return deploymentsToArchive.length;
      }

      // Archive deployments
      const archiveResult = await Deployment.updateMany(
        query,
        {
          archived: true,
          archivedAt: new Date(),
        },
        { session }
      );

      // Create audit logs
      for (const deployment of deploymentsToArchive) {
        const auditLog = new AuditLog({
          entityType: 'deployment',
          entityId: deployment._id,
          userId: 'system',
          action: 'archived',
          reason: 'scheduled_task',
          context: {
            source: 'system_cron',
            metadata: { archivedDays: olderThanDays },
          },
          timestamp: new Date(),
        });

        await auditLog.save({ session });
      }

      await session.commitTransaction();

      console.log(`[DBUtils] Archived ${archiveResult.modifiedCount} deployments older than ${olderThanDays} days`);

      return archiveResult.modifiedCount;
    } catch (error) {
      await session.abortTransaction();
      console.error('[DBUtils] Error archiving deployments:', error.message);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get deployment with full context (deployment + audit history)
   */
  static async getDeploymentWithAudit(deploymentId) {
    try {
      const [deployment, auditHistory] = await Promise.all([
        Deployment.findById(deploymentId).lean(),
        AuditLog.find(
          {
            entityType: 'deployment',
            entityId: deploymentId,
          }
        )
          .sort({ timestamp: -1 })
          .limit(50)
          .lean(),
      ]);

      if (!deployment) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      return {
        deployment,
        auditHistory,
      };
    } catch (error) {
      console.error('[DBUtils] Error fetching deployment with audit:', error.message);
      throw error;
    }
  }

  /**
   * Validate deployment data integrity
   */
  static async validateDeploymentIntegrity(deploymentId) {
    try {
      const deployment = await Deployment.findById(deploymentId);

      if (!deployment) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      const issues = [];

      // Check for required fields
      if (!deployment.userId) {
        issues.push('Missing userId');
      }

      if (!deployment.status) {
        issues.push('Missing status');
      }

      // Check for data consistency
      if (deployment.status === 'success' && !deployment.completedAt) {
        issues.push('Success status without completedAt timestamp');
      }

      if (deployment.status === 'failed' && !deployment.error) {
        issues.push('Failed status without error details');
      }

      if (deployment.publicUrl && !deployment.deploymentService) {
        issues.push('Public URL present without deploymentService');
      }

      // Validate timestamps
      if (deployment.startedAt && deployment.completedAt && deployment.startedAt > deployment.completedAt) {
        issues.push('startedAt is after completedAt');
      }

      // Validate retries
      if (deployment.retryCount > deployment.maxRetries) {
        issues.push(`retryCount (${deployment.retryCount}) exceeds maxRetries (${deployment.maxRetries})`);
      }

      return {
        valid: issues.length === 0,
        issues,
        deployment: {
          _id: deployment._id,
          status: deployment.status,
          phase: deployment.phase,
          userId: deployment.userId,
        },
      };
    } catch (error) {
      console.error('[DBUtils] Error validating deployment integrity:', error.message);
      throw error;
    }
  }

  /**
   * Create backup snapshot of deployment state
   */
  static async createDeploymentSnapshot(deploymentId, reason = 'manual') {
    try {
      const deployment = await Deployment.findById(deploymentId);

      if (!deployment) {
        throw new Error(`Deployment ${deploymentId} not found`);
      }

      // Create audit log with snapshot
      const snapshot = await AuditLog.create({
        entityType: 'deployment',
        entityId: deploymentId,
        userId: 'system',
        action: 'updated',
        reason: 'user_action',
        context: {
          source: 'api',
          metadata: { snapshotReason: reason },
        },
        snapshot: {
          deploymentState: {
            status: deployment.status,
            phase: deployment.phase,
            infrastructure: deployment.infrastructure,
            environment: deployment.environmentVariables,
            publicUrl: deployment.publicUrl,
          },
        },
        timestamp: new Date(),
      });

      console.log(`[DBUtils] Created snapshot for deployment ${deploymentId}`);

      return snapshot;
    } catch (error) {
      console.error('[DBUtils] Error creating deployment snapshot:', error.message);
      throw error;
    }
  }
}

module.exports = DatabaseUtilities;
