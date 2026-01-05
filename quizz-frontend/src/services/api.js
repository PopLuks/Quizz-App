import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData)
};

export const adminAPI = {
    getAllUsers: () => api.get('/admin/users'),
    toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle`),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    getUserAttempts: (userId) => api.get(`/admin/users/${userId}/attempts`)
};

export const quizAPI = {
    getAllQuizzes: () => api.get('/quizzes'),
    getMyQuizzes: () => api.get('/quizzes/my-quizzes'),
    getQuizById: (id) => api.get(`/quizzes/${id}`),
    createQuiz: (quizData) => api.post('/quizzes', quizData),
    updateQuiz: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
    deleteQuiz: (id) => api.delete(`/quizzes/${id}`),
    toggleQuizStatus: (id) => api.put(`/quizzes/${id}/toggle`)
};

export const attemptAPI = {
    submitQuiz: (data) => api.post('/attempts/submit', data),
    getMyAttempts: () => api.get('/attempts/my-attempts'),
    getAttemptById: (id) => api.get(`/attempts/${id}`)
};

export const questionBankAPI = {
    getAllQuestions: () => api.get('/question-bank'),
    getQuestionById: (id) => api.get(`/question-bank/${id}`),
    createQuestion: (questionData) => api.post('/question-bank', questionData),
    updateQuestion: (id, questionData) => api.put(`/question-bank/${id}`, questionData),
    deleteQuestion: (id) => api.delete(`/question-bank/${id}`)
};

export const statisticsAPI = {
    getStatistics: () => api.get('/statistics')
};

export default api;
