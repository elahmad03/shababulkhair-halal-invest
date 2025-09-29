import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders, AxiosHeaders } from 'axios';

const apiRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiRequest.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Ensure config.headers is defined, and cast it to AxiosRequestHeaders
  // to correctly handle the Authorization property.
  // Axios usually guarantees config.headers exists in an interceptor.
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    // Type assertion to AxiosRequestHeaders to ensure Authorization can be set
    // as it might be 'any' or an unexpected type if not explicitly handled.
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  // Handle request errors
  return Promise.reject(error);
});

export default apiRequest;