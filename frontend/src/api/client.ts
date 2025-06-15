// src/api/client.ts
import axios from "axios";

// Create axios instance with global configuration
const apiClient = axios.create({
  baseURL:
    (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001") + "/api",
  withCredentials: false, // Keep this false since your backend has credentials: false
  timeout: 10000,
});

// Optional: Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
