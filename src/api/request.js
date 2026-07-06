import axios from 'axios';
import {
  showToast
} from '../components/common/toast';

const request = axios.create({
  baseURL: 'http://localhost:8081/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    // get access token
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers['accessToken'] = accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false; // lock, avoid multiple refresh token requests at the same time
let requestsQueue = []; // queue to handle concurrent requests while refreshing token

request.interceptors.response.use(
  async (response) => {
    // response.data is mapping to 'Result' {code, msg, data}
    const result = response.data;

    // success
    if (result.code === 200) {
      return result.data; // Directly return the data part of Result
    }

    // Token has expired or needs refresh
    if (result.code === 4011) {
      const originalRequest = response.config;

      // Ensure we haven't retried yet, and aren't trying to refresh the refresh token itself
      if (!originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
        originalRequest._retry = true; // Mark as retrying

        if (isRefreshing) {
          return new Promise((resolve) => {
            requestsQueue.push((newAccessToken) => {
              originalRequest.headers['accessToken'] = newAccessToken;
              resolve(request(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('Refresh token not found');
          }

          const res = await axios.post(
            'http://localhost:8081/auth/refresh',
            null, {
              headers: {
                'Authorization-Refresh': refreshToken
              }
            }
          );

          const newAccessToken = res.data?.data?.accessToken;
          const newRefreshToken = res.data?.data?.refreshToken;

          if (!newAccessToken) {
            throw new Error('Failed to get new access token');
          }

          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers['accessToken'] = newAccessToken;

          requestsQueue.forEach(callback => callback(newAccessToken));
          requestsQueue = [];

          return request(originalRequest);

        } catch (refreshError) {
          requestsQueue = [];
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          showToast('Login expired. Please log in again.', 'error');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    // failed: other business errors
    const customError = new Error(result.msg || 'Error');
    customError.isBusinessError = true;    // mark this error as a business error
    customError.result = result;           // mount the whole result for potential further use
    return Promise.reject(customError);
  },
  (error) => {
    // Real HTTP errors (network issues, server errors, etc.)
    return Promise.reject(error);
  }
);

export default request;