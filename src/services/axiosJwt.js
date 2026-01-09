import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import * as UserService from './User.Service';

const axiosJwt = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
  withCredentials: true, 
})




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

export default axiosJwt;
