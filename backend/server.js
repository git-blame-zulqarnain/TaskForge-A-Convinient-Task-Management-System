const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http=require('http');
const { Server } = require('socket.io');


const connectDB = require('./src/config/db');
const taskRoutes = require('./src/routes/taskRoutes');
const userRoutes = require('./src/routes/userRoutes'); 
const notificationRoutes = require('./src/routes/notificationRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

dotenv.config();
connectDB();
const app = express();
const server= http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", 
        methods: ["GET", "POST", "PUT", "DELETE"] 
    }
});

app.use(cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('userConnected', (userId) => {
        if (userId) {
            console.log(`User ${userId} associated with socket ${socket.id}`);
            socket.join(userId); 
            console.log(`Socket ${socket.id} joined room: ${userId}`);
        } else {
            console.warn(`Socket ${socket.id} attempted 'userConnected' without a userId.`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
app.set('socketio', io);
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => { 
    console.log(`Server (HTTP & Socket.IO) running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});