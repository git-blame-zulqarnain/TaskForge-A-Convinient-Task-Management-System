const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const taskRoutes = require('./src/routes/taskRoutes');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const http = require('http'); 
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});


app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173" 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/tasks', taskRoutes);
let connectedUsers = {}; 

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('userConnected', (userId) => {
        console.log(`User ${userId} identified with socket ${socket.id}`);
        connectedUsers[userId] = socket.id;
        socket.join(userId);
        console.log('Current connected users:', connectedUsers);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
        console.log('Current connected users after disconnect:', connectedUsers);
    });
});

app.set('socketio', io);
app.set('connectedUsers', connectedUsers);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;


server.listen(PORT, () => { 
    console.log(`Server (HTTP & Socket.IO) running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});