import axios from 'axios';
import { setupAxiosCache } from './httpCache.js';

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/api'
      : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAxiosCache(axiosInstance, {
  ttl: 1000 * 60 * 5,
});
