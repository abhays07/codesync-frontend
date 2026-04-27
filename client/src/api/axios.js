import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9000/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true
});

// The "Interceptor": Think of this as a checkpoint for every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Standard Bearer token format for Spring Security
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Globally catch and format backend error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const backendMsg = error.response.data.message || error.response.data.error;
      if (typeof backendMsg === 'string' && backendMsg.trim() !== '') {
        error.message = backendMsg;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
