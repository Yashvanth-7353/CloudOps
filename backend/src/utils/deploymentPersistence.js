const Deployment = require('../models/Deployment');
const { maskSecrets, sanitizeData } = require('./logSanitizer');

async function pushDeploymentLog(deploymentId, logEntry) {
  const entry = {
    timestamp: logEntry.timestamp || new Date(),
    source: logEntry.source || 'system',
    level: logEntry.level || 'info',
    message: maskSecrets(logEntry.message || ''),
    data: sanitizeData(logEntry.data || {}),
    deploymentService: logEntry.deploymentService || null,
  };

  const update = { $push: { logs: entry } };
  if (entry.deploymentService === 'aws') {
    update.$push.awsLogs = {
      timestamp: entry.timestamp,
      source: entry.source,
      level: entry.level,
      message: entry.message,
      data: entry.data,
    };
  } else if (entry.deploymentService === 'azure') {
    update.$push.azureLogs = {
      timestamp: entry.timestamp,
      source: entry.source,
      level: entry.level,
      message: entry.message,
      data: entry.data,
    };
  }

  await Deployment.updateOne(
    { _id: deploymentId },
    update
  );

  return entry;
}

async function updateDeploymentFields(deploymentId, fields) {
  const $set = {};

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      $set[key] = value;
    }
  }

  if (Object.keys($set).length === 0) return null;

  return Deployment.updateOne({ _id: deploymentId }, { $set });
}

module.exports = {
  pushDeploymentLog,
  updateDeploymentFields,
};
