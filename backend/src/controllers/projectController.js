const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

// Update project (used to update environment variables)
const updateProject = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (String(project.userId) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    // Support updating environmentVariables via body.environmentVariables (object or array)
    const { environmentVariables } = req.body;
    if (environmentVariables) {
      // If object map provided, convert to array
      if (!Array.isArray(environmentVariables) && typeof environmentVariables === 'object') {
        project.environmentVariables = Object.entries(environmentVariables).map(([k, v]) => ({ key: k, value: String(v), encrypted: false }));
      } else if (Array.isArray(environmentVariables)) {
        project.environmentVariables = environmentVariables.map((e) => ({ key: e.key, value: e.value, encrypted: !!e.encrypted }));
      }
    }

    // Allow partial updates of a single key/value
    const { key, value } = req.body;
    if (key && typeof value !== 'undefined') {
      const existingIndex = project.environmentVariables?.findIndex((v) => v.key === key);
      if (existingIndex >= 0) {
        project.environmentVariables[existingIndex].value = String(value);
      } else {
        project.environmentVariables = project.environmentVariables || [];
        project.environmentVariables.push({ key, value: String(value), encrypted: false });
      }
    }

    await project.save();

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Get a project by id
const getProject = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (String(project.userId) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Get all projects for the authenticated user
const getProjects = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);

    const projects = await Project.find({ userId }).sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  updateProject,
  getProject,
  getProjects,
};
