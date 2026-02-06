// src/api/axios.js
import axios from "axios";

// Determine API URL based on environment
// In Docker/production: Use relative URL (nginx will proxy)
// In development: Use localhost:3000
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to relative URL for Docker/production
  // Nginx will proxy /api/* requests to backend:3000
  if (process.env.NODE_ENV === 'production') {
    return ''; // Empty = relative URL (same host)
  }
  
  // Development: use localhost
  return 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false // Important: Don't send credentials with wildcard origins
});

// Logging interceptor for debugging
api.interceptors.request.use(config => {
  console.log('[AXIOS] REQUEST →', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('[AXIOS] RESPONSE ←', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('[AXIOS] ERROR ✗', error.response?.status || error.code, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;