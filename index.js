const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const calendarRoutes = require('./routes/calendar');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads directory static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add Socket.io to the request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/calendar', calendarRoutes);

// Socket.io authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    // In a real app, you would verify the JWT token here
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //   if (err) return next(new Error('Authentication error'));
    //   socket.userId = decoded.id;
    //   next();
    // });

    // For demo purposes, we'll just set a placeholder user ID
    socket.userId = 'demo-user-id';
    next();
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join user to their own room
    socket.join(socket.userId);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://laibakhawar:laiba1697@edistandard.7i80w.mongodb.net/todolist')
    .then(() => {
        console.log('Connected to MongoDB');

        // Start server
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Export for testing purposes
module.exports = { app, io };