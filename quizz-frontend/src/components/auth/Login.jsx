import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setToast({ message: 'Please fill in all fields', type: 'error' });
            return;
        }

        setLoading(true);
        console.log('Attempting login with:', formData.username); // DEBUG

        try {
            const result = await login(formData.username, formData.password);
            
            console.log('Login result:', result); // DEBUG
            
            if (result.success) {
                setToast({ message: 'Login successful! 🎉', type: 'success' });
                
                setTimeout(() => {
                    console.log('Redirecting to dashboard...'); // DEBUG
                    navigate('/dashboard', { replace: true });
                }, 1500);
            } else {
                setToast({ message: result.message || 'Login failed', type: 'error' });
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            setToast({ message: 'An error occurred. Please try again.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back! 👋</h1>
                    <p className="auth-subtitle">Login to access your quiz dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>USERNAME</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'LOGGING IN...' : 'LOGIN 🚀'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
