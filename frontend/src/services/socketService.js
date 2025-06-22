import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
let socket; 

export const connectSocket = (token, userId) => {
    if (socket && socket.connected) {
        console.log("socketService: Disconnecting existing socket before reconnecting.");
        socket.disconnect();
    }

    console.log(`socketService: Attempting to connect socket to ${SOCKET_URL} for user ${userId}`);
    socket = io(SOCKET_URL, {
        auth: {
            token: token, 
        },
        transports: ['websocket'], 
        reconnectionAttempts: 5, 
        reconnectionDelay: 1000, 
    });

    socket.on('connect', () => {
        console.log('socketService: Socket connected successfully with ID:', socket.id);
        if (userId) {
            socket.emit('userConnected', userId);
            console.log(`socketService: Emitted 'userConnected' for userId: ${userId}`);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('socketService: Socket disconnected. Reason:', reason);
    });

    socket.on('connect_error', (err) => {
        console.error('socketService: Socket connection error:', err.message, err.data ? err.data : '');
    });

    return socket; 
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        console.log('socketService: Disconnecting socket explicitly.');
        socket.disconnect();
    }
    socket = null; 
};

export const getSocket = () => {
    return socket;
};