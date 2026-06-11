/**
 * AuditLog Model
 * Tracks all changes to deployments and critical operations
 * Implements industry-standard audit trail for compliance and debugging
 */

const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    // What entity was changed
    entityType: {
      type: String,
      enum: ['deployment', 'project', 'user', 'infrastructure', 'webhook', 'system'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Who made the change
    userId: {
      type: String,
      index: true,
      default: 'system', // For system-triggered actions
    },

    // What changed
    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'deleted',
        'status_changed',
        'phase_changed',
        'log_added',
        'infrastructure_created',
        'infrastructure_updated',
        'error_occurred',
        'retry_attempted',
        'cancelled',
        'redeployed',
        'archived',
        'rollback_initiated',
        'webhook_received',
      ],
      required: true,
      index: true,
    },

    // When it changed
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // What was the change
    changes: {
      before: mongoose.Schema.Types.Mixed, // Previous values
      after: mongoose.Schema.Types.Mixed, // New values
    },

    // Why it changed
    reason: {
      type: String,
      enum: ['user_action', 'system_event', 'webhook_trigger', 'error_recovery', 'scheduled_task', 'manual_admin'],
      default: 'user_action',
    },

    // Additional context
    context: {
      ipAddress: String,
      userAgent: String,
      requestId: String, // Correlate with HTTP request logs
      phase: String, // Current deployment phase when change occurred
      source: {
        type: String,
        enum: ['api', 'webhook', 'cli', 'dashboard', 'system_cron', 'event_bus'],
      },
      metadata: mongoose.Schema.Types.Mixed, // Custom context data
    },

    // For tracking related changes
    relatedAuditIds: [mongoose.Schema.Types.ObjectId],

    // Error information if action failed
    error: {
      code: String,
      message: String,
      stack: String,
    },

    // Data preservation for rollback capability
    snapshot: {
      deploymentState: mongoose.Schema.Types.Mixed, // Full deployment state at this point
      infrastructureState: mongoose.Schema.Types.Mixed, // Infrastructure config snapshot
    },

    // Performance tracking
    duration: Number, // How long the action took (ms)
    resourcesAffected: [String], // IDs of resources created/modified (EC2, S3, etc.)
  },
  {
    timestamps: true,
    collection: 'auditLogs',
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ 'context.requestId': 1 });
// Note: TTL index created separately in initializeDatabase.js to avoid conflicts

module.exports = mongoose.model('AuditLog', AuditLogSchema);
