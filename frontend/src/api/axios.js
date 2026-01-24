import axios from 'axios';

// Create axios instance with custom config
const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// REQUEST INTERCEPTOR - Log every request
apiClient.interceptors.request.use(
  (config) => {
    console.log('🔵 [API REQUEST]', {
      method: config.method.toUpperCase(),
      url: config.url,
      data: config.data,
      timestamp: new Date().toISOString()
    });
    return config;
  },
  (error) => {
    console.error('❌ [REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Log responses and handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ [API SUCCESS]', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    let errorMessage = 'Connection Lost - Unknown Error';
    let httpStatus = 'UNKNOWN';

    if (error.response) {
      // Server responded with error status
      httpStatus = error.response.status;
      
      if (error.response.status === 404) {
        errorMessage = 'Connection Lost - Endpoint Not Found (404)';
      } else if (error.response.status === 500) {
        errorMessage = 'Connection Lost - Server Error (500)';
      } else if (error.response.status === 403) {
        errorMessage = error.response.data?.message || 'Access Denied (403)';
      } else {
        errorMessage = `Connection Lost - Server Error (${error.response.status})`;
      }
      
      console.error('❌ [API ERROR - RESPONSE]', {
        status: httpStatus,
        url: error.config.url,
        message: error.response.data?.message || error.response.statusText,
        timestamp: new Date().toISOString()
      });
    } else if (error.request) {
      // Request made but no response
      httpStatus = 'CORS_OR_NETWORK_ERROR';
      errorMessage = 'Connection Lost - Network/CORS Error. Make sure backend is running on port 3000.';
      
      console.error('❌ [API ERROR - NO RESPONSE]', {
        url: error.config?.url,
        message: 'No response from server',
        timestamp: new Date().toISOString()
      });
    } else {
      // Error in request setup
      httpStatus = 'REQUEST_SETUP_ERROR';
      errorMessage = 'Connection Lost - Request Setup Error';
      
      console.error('❌ [API ERROR - SETUP]', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('connectionError', {
      detail: {
        message: errorMessage,
        httpStatus: httpStatus,
        timestamp: new Date().toISOString()
      }
    }));

    return Promise.reject({
      message: errorMessage,
      httpStatus: httpStatus,
      originalError: error
    });
  }
);

export default apiClient;
