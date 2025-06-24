import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

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
  try {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const createTask = async (taskData) => {
  try {

    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTaskById = async (id) => {
  try {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
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
  try {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getTasksSummaryStats = async () => {
  try {
    const response = await apiClient.get('/tasks/summary/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching task summary stats:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const shareTaskWithUser = async (taskId, shareData) => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}/share`, shareData);
    return response.data;
  } catch (error) {
    console.error(`Error sharing task ${taskId}:`, error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getSharedWithMeTasks = async () => {
  try {
    const response = await apiClient.get('/tasks/shared');
    return response.data;
  } catch (error) {
    console.error('Error fetching shared tasks:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const getUsersForSharing = async () => {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_BASE_URL}/users/list`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching users for sharing:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch users for sharing list.');
    }
};