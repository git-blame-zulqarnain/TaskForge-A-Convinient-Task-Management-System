import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserService, registerUserService } from '../services/authService.js';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(() => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        return { token, user, isAuthenticated: !!token && !!user?._id };
    });

    useEffect(() => {
        if (authState.isAuthenticated && authState.user?._id && authState.token) {
            console.log("AuthContext: User authenticated, connecting socket for user:", authState.user._id);
            connectSocket(authState.token, authState.user._id);
        } else {
            console.log("AuthContext: User not authenticated or user data missing, disconnecting socket.");
            disconnectSocket();
        }

        return () => {
            console.log("AuthContext: Cleanup effect, disconnecting socket.");
            disconnectSocket();
        };
    }, [authState.isAuthenticated, authState.user?._id, authState.token]); 

    const login = async (credentials) => {
        console.log("AUTH_CONTEXT: Attempting login with credentials:", credentials);
        try {
            const data = await loginUserService(credentials); 
            console.log("AUTH_CONTEXT: Data received from loginUserService:", data);
            if (data && data.token && data._id && data.name && data.email) {
                const userForState = { _id: data._id, name: data.name, email: data.email };
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userForState));
                setAuthState({ token: data.token, user: userForState, isAuthenticated: true });
                console.log("AUTH_CONTEXT: Login successful, authState updated.");
            } else {
                console.error("AUTH_CONTEXT: Login response did not include expected data. Data:", data);
                throw new Error(data?.message || 'Login failed: Invalid response from server.');
            }
        } catch (error) {
            console.error("AUTH_CONTEXT: Login API call failed:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        console.log("AUTH_CONTEXT: Attempting registration with userData:", userData);
        try {
            const data = await registerUserService(userData); 
            console.log("AUTH_CONTEXT: Data received from registerUserService:", data);
            if (data && data.token && data._id && data.name && data.email) {
                const userForState = { _id: data._id, name: data.name, email: data.email };
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userForState));
                setAuthState({ token: data.token, user: userForState, isAuthenticated: true });
                console.log("AUTH_CONTEXT: Registration successful, authState updated.");
            } else {
                console.error("AUTH_CONTEXT: Registration response did not include expected data. Data:", data);
                throw new Error(data?.message || 'Registration response did not include expected data.');
            }
        } catch (error) {
            console.error("AUTH_CONTEXT: Registration API call failed:", error);
            throw error;
        }
    };


    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ token: null, user: null, isAuthenticated: false });
        console.log("AUTH_CONTEXT: User logged out.");
    };

    const getSocketInstance = () => getSocket();

    return (
        <AuthContext.Provider value={{ authState, login, logout, register, getSocketInstance }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};