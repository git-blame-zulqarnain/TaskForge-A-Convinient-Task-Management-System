import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// This is the apiClient for TASKS
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

export const getAllTasks = async (params = {}) => { 
  try 
  {
    const response = await apiClient.get('/tasks', { params }); 
    return response.data;
  } 
  catch (error) 
  {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  } 
  catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTaskById = async (id) => {
  try 
  {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  } 
  catch (error) 
  {
    console.error(`Error fetching task ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const deleteTask = async (id) => {
  try 
  {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  } 
  catch (error) 
  {
    console.error(`Error deleting task ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTasksSummaryStats = async () => {
  try {
    const response = await apiClient.get('/tasks/summary/stats'); // Uses the new backend route
    return response.data; // Expected: { totalTasks, completedTasks }
  } catch (error) {
    console.error('Error fetching task summary stats:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};