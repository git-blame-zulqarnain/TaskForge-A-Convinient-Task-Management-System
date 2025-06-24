import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const ANALYTICS_ENDPOINT = `${API_BASE_URL}/analytics`;

const apiClient = axios.create({
  baseURL: ANALYTICS_ENDPOINT,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAnalyticsOverview = async () => {
  try {
    const response = await apiClient.get('/overview');
    return response.data; 
  } catch (error) {
    console.error('Error fetching analytics overview:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch analytics overview.');
  }
};

export const getAnalyticsTrends = async (params = { period: 'last7days', dataType: 'created' }) => {
  try {
    const response = await apiClient.get('/trends', { params });
    return response.data; 
  } catch (error) {
    console.error('Error fetching analytics trends:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch analytics trends.');
  }
};