import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Creează instanța axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor pentru request - ADAUGĂ TOKEN LA FIECARE REQUEST
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        console.log('🔍 Interceptor - Request to:', config.method?.toUpperCase(), config.url);
        console.log('🔍 Token exists:', !!token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...');
        } else {
            console.warn('⚠️ No token found in localStorage!');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Interceptor pentru response
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response from:', response.config.url, '- Status:', response.status);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data
        });
        
        // NU deconecta automat la 403 dacă ești admin și faci toggle
        if (error.response?.status === 401) {
            console.log('🚫 Unauthorized (401) - Token invalid or expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.log('🚫 Forbidden (403) - Access denied');
            
            // Nu deconecta automat - lasă componenta să decidă
            // Doar afișează eroarea
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Current user:', currentUser);
            
            // Deconectează doar dacă nu ești admin
            if (currentUser.role !== 'ADMIN') {
                console.log('Non-admin user - redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData)
};

export const adminAPI = {
    getAllUsers: () => {
        console.log('📡 API Call: GET /admin/users');
        return api.get('/admin/users');
    },
    toggleUserStatus: (userId) => {
        console.log('📡 API Call: PUT /admin/users/' + userId + '/toggle');
        return api.put(`/admin/users/${userId}/toggle`);
    },
    deleteUser: (userId) => {
        console.log('📡 API Call: DELETE /admin/users/' + userId);
        return api.delete(`/admin/users/${userId}`);
    }
};

export default api;
