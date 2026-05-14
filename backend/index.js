const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // <-- Added HTTP module
const { Server } = require('socket.io'); // <-- Added Socket.io
require('dotenv').config();

// Bypass strict SSL for local dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. WEBSOCKET SETUP ---
// We create the HTTP server FIRST, wrapping the Express app
const server = http.createServer(app);

// Attach Socket.io to that HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your frontend to connect
        methods: ["GET", "POST"]
    }
});

// Attach socket.io to the app so controllers can use it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🔌 Client connected to log stream: ${socket.id}`);
    
    socket.on('join-deployment', (roomName) => {
        socket.join(roomName);
        console.log(`Client joined deployment room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
// --------------------------

// --- 2. MIDDLEWARE & DB ---
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// --- 3. ROUTES ---
const authRoutes = require('./src/routes/authRoutes');
const githubRoutes = require('./src/routes/githubRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const userRoutes = require('./src/routes/userRoutes');
const deployRoutes = require('./src/routes/deployRoutes');
const deploymentRoutes = require('./src/routes/deploymentRoutes');

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRoutes);
app.use('/api', deployRoutes);
app.use('/api/deploy', deploymentRoutes);

// --- 4. START SERVER ---
// CRITICAL: We use server.listen() here, NOT app.listen()!
server.listen(PORT, () => {
    console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
});