import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // La încărcarea aplicației, verifică dacă există user în localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('AuthContext init - Token:', !!token, 'User:', storedUser); // DEBUG
        
        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                console.log('Restoring user from localStorage:', userData); // DEBUG
                setUser(userData);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('AuthContext - Login attempt for:', username); // DEBUG
            const response = await authAPI.login({ username, password });
            
            console.log('AuthContext - Login response:', response.data); // DEBUG
            
            const { token, username: user, email, role } = response.data;
            
            // Salvează token-ul
            localStorage.setItem('token', token);
            
            // Salvează datele utilizatorului
            const userData = { username: user, email, role };
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Actualizează state-ul
            setUser(userData);
            
            console.log('AuthContext - User set:', userData); // DEBUG
            
            return { success: true };
        } catch (error) {
            console.error('AuthContext - Login error:', error);
            
            // Verifică dacă eroarea este "Account disabled"
            if (error.response?.data?.message?.includes('disabled')) {
                return { 
                    success: false, 
                    message: 'Your account has been disabled. Please contact support.' 
                };
            }
            
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    };

    const signup = async (username, email, password) => {
        try {
            await authAPI.signup({ username, email, password });
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Signup failed. Please try again.' 
            };
        }
    };

    const logout = () => {
        console.log('AuthContext - Logging out'); // DEBUG
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = user?.role === 'ADMIN';

    console.log('AuthContext render - User:', user, 'Loading:', loading); // DEBUG

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
