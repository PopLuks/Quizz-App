import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setToast({ message: 'Please fill in all fields', type: 'error' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setToast({ message: 'Passwords do not match!', type: 'error' });
            return;
        }

        if (formData.password.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const result = await signup(formData.username, formData.email, formData.password);
            
            if (result.success) {
                setToast({ message: 'Account created! Redirecting to login...', type: 'success' });
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setToast({ message: result.message || 'Signup failed', type: 'error' });
                setLoading(false);
            }
        } catch (error) {
            console.error('Signup error:', error);
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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us and start your quiz journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>USERNAME</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>EMAIL</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
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
                            placeholder="Create a password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-auth"
                        disabled={loading}
                    >
                        {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
