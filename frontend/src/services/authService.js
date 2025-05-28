import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const authApiClient = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUserService = async (userData) => {
  try {
    const response = await authApiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Registration failed');
  }
};

export const loginUserService = async (credentials) => {
  try {
    const response = await authApiClient.post('/login', credentials);
    return response.data; // Should contain user info and token
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};