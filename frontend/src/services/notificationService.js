import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/notifications`;

const apiClient = axios.create({
  baseURL: NOTIFICATIONS_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getMyNotifications = async () => {
  try {
    const response = await apiClient.get('/'); 
    return response.data; 
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch notifications.');
  }
};

export const markNotificationsAsReadService = async (notificationIds) => { 
  try {
    const response = await apiClient.put('/mark-read', { notificationIds }); 
    return response.data; 
  } catch (error) {
    console.error('Error marking notifications as read:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to mark notifications as read.');
  }
};

export const markAllNotificationsAsReadService = async () => { 
  try {
    const response = await apiClient.put('/mark-all-read'); 
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to mark all notifications as read.');
  }
};