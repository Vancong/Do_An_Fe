import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import * as UserService from './User.Service';

const axiosJwt = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
  withCredentials: true, 
})

// Biến để tránh refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosJwt.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');
    
    // Parse token nếu nó là JSON string
    try {
      if (token && token.startsWith('"')) {
        token = JSON.parse(token);
      }
    } catch (e) {
      // Token không phải JSON, giữ nguyên
    }
    
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (err) {
      console.log('Token không hợp lệ:', err);
    }

    const currentTime = Date.now() / 1000;
    if (decodedToken?.exp < currentTime) {
      try {
        const data = await UserService.refreshToken();
        if (data?.access_token) {
          const tokenToSave = typeof data.access_token === 'string' 
            ? data.access_token 
            : JSON.stringify(data.access_token);
          localStorage.setItem('access_token', tokenToSave);
          config.headers['token'] = `Bearer ${data.access_token}`;
        }
      } catch (err) {
        console.error('Refresh token thất bại', err);
      }
    } else if (token) {
      // Đảm bảo token không có dấu ngoặc kép thừa
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      config.headers['token'] = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để tự động refresh token khi gặp lỗi 401/404
axiosJwt.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý refresh token nếu có token trong localStorage và lỗi là 401/404
    const hasToken = localStorage.getItem('access_token');
    
    // Nếu lỗi là 401 hoặc 404, có token, và chưa retry
    if (hasToken && 
        (error.response?.status === 401 || error.response?.status === 404) && 
        !originalRequest._retry) {
      
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['token'] = `Bearer ${token}`;
          return axiosJwt(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await UserService.refreshToken();
        
        if (data?.status === 'OK' && data?.access_token) {
          const tokenToSave = typeof data.access_token === 'string' 
            ? data.access_token 
            : JSON.stringify(data.access_token);
          localStorage.setItem('access_token', tokenToSave);
          
          // Cập nhật token trong header của request gốc
          originalRequest.headers['token'] = `Bearer ${data.access_token}`;
          
          // Xử lý queue
          processQueue(null, data.access_token);
          isRefreshing = false;
          
          // Retry request gốc với token mới
          return axiosJwt(originalRequest);
        } else {
          // Refresh token thất bại, xóa token và redirect về login
          localStorage.removeItem('access_token');
          processQueue(new Error('Refresh token thất bại'), null);
          isRefreshing = false;
          
          // Redirect về trang login nếu đang ở trang admin
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/sign-in';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh token thất bại
        localStorage.removeItem('access_token');
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Redirect về trang login nếu đang ở trang admin
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/sign-in';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosJwt;
