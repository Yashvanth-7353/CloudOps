const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // <-- Changed to String to accept GitHub IDs
  repositoryName: { type: String, required: true },
  repositoryOwner: { type: String, required: true },
  repositoryUrl: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  description: String,
  environmentVariables: [{
    key: String,
    value: String,
    encrypted: { type: Boolean, default: false },
  }],
  status: { 
    type: String, 
    enum: ['connected', 'deploying', 'active', 'failed'], 
    default: 'connected' 
  },
  githubWebhookId: String,
  webhookSecret: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);