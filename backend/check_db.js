const mongoose = require('mongoose');
require('dotenv').config();

const Deployment = require('./src/models/Deployment');

async function checkDeployments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const totalCount = await Deployment.countDocuments();
    console.log('Total deployments in database:', totalCount);

    if (totalCount > 0) {
      const sample = await Deployment.findOne().limit(1);
      console.log('Sample deployment:', {
        id: sample._id,
        userId: sample.userId,
        status: sample.status,
        framework: sample.framework,
        createdAt: sample.createdAt
      });

      // Check deployments by status
      const statusCounts = await Deployment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('Deployments by status:', statusCounts);

      // Check recent deployments
      const recent = await Deployment.find().sort({ createdAt: -1 }).limit(5);
      console.log('Recent deployments:');
      recent.forEach((d, i) => {
        console.log(`  ${i+1}. ${d.repositoryName} - ${d.status} - ${d.createdAt}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDeployments();