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
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = Buffer.from(buf);
    },
}));

// --- MONGODB CONNECTION ---
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
    } catch (err) {
        console.error('❌ MongoDB connection error:');

        // More actionable hints for common failures
        const errmsg = (err && (err.message || (err.errorResponse && err.errorResponse.errmsg))) || '';
        if (/Authentication failed|bad auth/i.test(errmsg) || (err && err.codeName === 'AtlasError')) {
            console.error('Authentication failed: check MongoDB username/password in backend/.env.');
            console.error('If your password has special characters, URL-encode it (e.g. replace @ with %40).');
            console.error('Also confirm the Atlas DB user exists and has proper roles.');
        } else if (/querySrv|ENOTFOUND/i.test(errmsg) || (err && err.code === 'ENOTFOUND')) {
            console.error('DNS/SRV lookup failed: try using the non-SRV connection string or check DNS settings.');
        } else if (/ECONNREFUSED|connection refused/i.test(errmsg)) {
            console.error('Connection refused: confirm network access, firewall rules, and Atlas IP whitelist.');
        } else if (/IP|whitelist|replica set|No primary/i.test(errmsg)) {
            console.error('Atlas access issue: make sure your current IP is whitelisted in MongoDB Atlas.');
            console.error('If you are using a VPN, hotspot, or changing IP frequently, add a broader Atlas access rule for development.');
        }

        console.error(err);
        throw err;
    }
};

const startServer = async () => {
    await connectMongo();

    // --- 3. ROUTES ---
    const authRoutes = require('./src/routes/authRoutes');
    const githubRoutes = require('./src/routes/githubRoutes');
    const apiRoutes = require('./src/routes/apiRoutes');
    const userRoutes = require('./src/routes/userRoutes');
    const deployRoutes = require('./src/routes/deployRoutes');
    const deploymentRoutes = require('./src/routes/deploymentRoutes');
    const awsRoutes = require('./src/routes/awsRoutes');
    const azureDeployRoutes = require('./src/routes/azureDeployRoutes');
    const projectRoutes = require('./src/routes/projectRoutes');

    app.use('/auth', authRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/github', githubRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api', apiRoutes);
    app.use('/api', deployRoutes);
    app.use('/api/deploy', deploymentRoutes);
    app.use('/api/aws', awsRoutes); // AWS integration routes
    app.use('/api/azure', azureDeployRoutes); // Azure integration routes
    app.use('/api/projects', projectRoutes);

    // --- 4. START SERVER ---
    // CRITICAL: We use server.listen() here, NOT app.listen()!
    server.listen(PORT, () => {
        console.log(`✅ Server is sprinting on http://localhost:${PORT}`);
    });
};

startServer().catch((err) => {
    console.error('🚨 Server startup aborted because MongoDB connection failed.');
    process.exit(1);
});