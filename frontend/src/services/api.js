import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add a request interceptor to include the session_id or auth token in headers
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  const token = localStorage.getItem('token');
  const superAdminToken = localStorage.getItem('superAdminToken');
  
  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }
  
  // Use restaurant admin/staff token if available, else use super admin token
  const activeToken = token || superAdminToken;
  if (activeToken) {
    config.headers['Authorization'] = `Bearer ${activeToken}`;
  }
  
  return config;
});

export default api;
