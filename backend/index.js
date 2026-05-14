const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Prevent async deployment errors from crashing the server
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Socket.io — used by Azure deploy for real-time log streaming
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.emit('socket:ready', { socketId: socket.id });
});

const authRoutes = require('./src/routes/authRoutes');
const githubRoutes = require('./src/routes/githubRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const userRoutes = require('./src/routes/userRoutes');
const deployRoutes = require('./src/routes/deployRoutes');
const deploymentRoutes = require('./src/routes/deploymentRoutes');
const azureDeployRoutes = require('./src/routes/azureDeployRoutes');

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/api', deployRoutes);
app.use('/api/deploy', deploymentRoutes);
app.use('/api/azure', azureDeployRoutes);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
