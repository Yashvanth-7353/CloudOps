const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Unique GitHub identifier (e.g., "189037606")
  githubId: { type: String, required: true, unique: true },

  // The username displayed in your UI (e.g., "Spandana365")
  username: { type: String, required: true },

  // Primary email associated with the GitHub account
  email: { type: String, required: true, unique: true },

  // URL to their GitHub profile picture for the Header/Profile page
  avatarUrl: { type: String },

  // OAuth access token for interacting with GitHub API on their behalf
  accessToken: { type: String, required: true },

  // User preferences for your Dashboard
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    defaultDeploymentRegion: { type: String, default: 'us-east-1' }
  },

  // Timestamps for "Member Since" and tracking activity
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

// Update lastLogin every time they sign in
userSchema.methods.updateLoginTime = function () {
  this.lastLogin = Date.now();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
