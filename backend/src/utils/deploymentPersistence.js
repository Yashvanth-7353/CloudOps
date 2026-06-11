/**
 * Enhanced Deployment Persistence
 * Provides safe, audited persistence of deployment data
 * Integrates with EnhancedLogger and DatabaseUtilities for best practices
 */

const Deployment = require('../models/Deployment');
const { maskSecrets, sanitizeData } = require('./logSanitizer');
const EnhancedLogger = require('./enhancedLogger');
const DatabaseUtilities = require('./databaseUtilities');

/**
 * Legacy function for backward compatibility
 * DEPRECATED: Use EnhancedLogger.addDeploymentLog instead
 */
async function pushDeploymentLog(deploymentId, logEntry) {
  try {
    return await EnhancedLogger.addDeploymentLog(deploymentId, {
      source: logEntry.source || 'system',
      level: logEntry.level || 'info',
      message: logEntry.message || '',
      data: logEntry.data || {},
      deploymentService: logEntry.deploymentService || null,
      phase: logEntry.phase || null,
    });
  } catch (error) {
    console.error('[DeploymentPersistence] Error pushing log:', error);
    throw error;
  }
}

/**
 * Update deployment fields with validation
 * ENHANCED: Now validates field types and uses optimistic locking
 */
async function updateDeploymentFields(deploymentId, fields, { userId = 'system', reason = 'user_action' } = {}) {
  try {
    const $set = {};

    // Validate and sanitize input fields
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        // Sanitize sensitive fields
        if (['githubAccessToken', 'webhookSecret', 'password'].includes(key)) {
          $set[key] = maskSecrets(String(value));
        } else {
          $set[key] = value;
        }
      }
    }

    if (Object.keys($set).length === 0) return null;

    // Add timestamp
    $set.updatedAt = new Date();

    // Use database utilities for safe update
    const result = await DatabaseUtilities.updateDeploymentWithLocking(
      deploymentId,
      { $set },
      { userId, reason }
    );

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error updating deployment fields:', error);
    throw error;
  }
}

/**
 * Safe infrastructure update with full object reassignment
 */
async function updateInfrastructure(deploymentId, service, updates, { userId = 'system' } = {}) {
  try {
    // Use DatabaseUtilities to prevent partial overwrites
    const result = await DatabaseUtilities.updateInfrastructure(deploymentId, service, updates);

    // Log the infrastructure update
    await EnhancedLogger.addDeploymentLog(deploymentId, {
      source: 'system',
      level: 'info',
      message: `Updated infrastructure.${service}`,
      data: sanitizeData({ updates }),
    });

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error updating infrastructure:', error);
    throw error;
  }
}

/**
 * Update deployment status with audit trail
 */
async function updateDeploymentStatus(deploymentId, newStatus, { phase = null, userId = 'system', reason = 'user_action' } = {}) {
  try {
    const result = await EnhancedLogger.updateDeploymentStatus(deploymentId, {
      newStatus,
      newPhase: phase,
      userId,
      reason,
    });

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error updating deployment status:', error);
    throw error;
  }
}

/**
 * Record error with full audit trail
 */
async function recordDeploymentError(deploymentId, error, { phase = null, source = 'system', userId = 'system', recoveryAction = null } = {}) {
  try {
    const result = await EnhancedLogger.recordDeploymentError(deploymentId, {
      error,
      phase,
      source,
      userId,
      recoveryAction,
    });

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error recording deployment error:', error);
    throw error;
  }
}

/**
 * Record phase timing metrics
 */
async function recordPhaseTiming(deploymentId, phase, { startTime, endTime = null, duration = null } = {}) {
  try {
    const result = await DatabaseUtilities.recordPhaseTiming(deploymentId, phase, {
      startTime,
      endTime,
      duration,
    });

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error recording phase timing:', error);
    throw error;
  }
}

/**
 * Mark deployment as complete with timing
 */
async function markDeploymentComplete(deploymentId, { status = 'success', totalTime = null, publicUrl = null, userId = 'system' } = {}) {
  try {
    const deployment = await Deployment.findById(deploymentId);

    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    const updates = {
      status: status,
      phase: 'complete',
      completedAt: new Date(),
    };

    if (totalTime !== null) {
      updates.totalTime = totalTime;
    }

    if (publicUrl) {
      updates.publicUrl = publicUrl;
      updates.domainUrl = publicUrl;
      updates.healthStatus = 'healthy';
    }

    if (status === 'success') {
      updates.healthStatus = 'healthy';
    } else if (status === 'failed') {
      updates.healthStatus = 'unhealthy';
    }

    const result = await updateDeploymentStatus(deploymentId, status, {
      phase: 'complete',
      userId,
      reason: 'system_event',
    });

    // Merge additional fields
    await Deployment.findByIdAndUpdate(deploymentId, { $set: updates });

    await EnhancedLogger.addDeploymentLog(deploymentId, {
      source: 'system',
      level: status === 'success' ? 'success' : 'error',
      message: `Deployment marked as ${status}`,
      data: { totalTime, publicUrl, healthStatus: updates.healthStatus },
    });

    return result;
  } catch (error) {
    console.error('[DeploymentPersistence] Error marking deployment complete:', error);
    throw error;
  }
}

/**
 * Create deployment snapshot for audit/rollback
 */
async function createDeploymentSnapshot(deploymentId, reason = 'manual') {
  try {
    return await DatabaseUtilities.createDeploymentSnapshot(deploymentId, reason);
  } catch (error) {
    console.error('[DeploymentPersistence] Error creating snapshot:', error);
    throw error;
  }
}

/**
 * Get deployment with full audit context
 */
async function getDeploymentWithAudit(deploymentId) {
  try {
    return await DatabaseUtilities.getDeploymentWithAudit(deploymentId);
  } catch (error) {
    console.error('[DeploymentPersistence] Error fetching deployment with audit:', error);
    throw error;
  }
}

/**
 * Validate deployment data integrity
 */
async function validateDeploymentIntegrity(deploymentId) {
  try {
    return await DatabaseUtilities.validateDeploymentIntegrity(deploymentId);
  } catch (error) {
    console.error('[DeploymentPersistence] Error validating deployment:', error);
    throw error;
  }
}

module.exports = {
  // Legacy
  pushDeploymentLog,
  updateDeploymentFields,

  // New enhanced functions
  updateInfrastructure,
  updateDeploymentStatus,
  recordDeploymentError,
  recordPhaseTiming,
  markDeploymentComplete,
  createDeploymentSnapshot,
  getDeploymentWithAudit,
  validateDeploymentIntegrity,

  // Re-export utilities
  EnhancedLogger,
  DatabaseUtilities,
};
