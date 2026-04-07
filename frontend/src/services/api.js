import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add a request interceptor to include the session_id in headers if needed
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  const adminToken = localStorage.getItem('adminToken');
  
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  
  if (adminToken) {
    config.headers['Authorization'] = `Bearer ${adminToken}`;
  }
  
  return config;
});

export default api;
