import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);

    const handleLogout = () => {
        setToast({ message: 'Logging out... See you soon!', type: 'info' });
        setTimeout(() => {
            logout();
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="dashboard-container">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            <nav className="dashboard-nav">
                <h1>Quiz Application</h1>
                <div className="nav-user">
                    <span className="user-role">{isAdmin ? 'Admin' : 'User'}</span>
                    <span className="user-name">{user?.username}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h2>Welcome, {user?.username}! 👋</h2>
                    <p className="user-email">{user?.email}</p>
                    <div className="role-badge">
                        {isAdmin ? '🔑 Administrator' : '👤 User'}
                    </div>
                </div>

                <div className="features-grid">
                    {isAdmin ? (
                        <>
                            <div className="feature-card">
                                <h3>📝 Manage Quizzes</h3>
                                <p>Create, edit, and delete quizzes</p>
                                <button className="btn-feature">Go to Quizzes</button>
                            </div>
                            <div className="feature-card">
                                <h3>❓ Manage Questions</h3>
                                <p>Add and manage quiz questions</p>
                                <button className="btn-feature">Manage Questions</button>
                            </div>
                            <div className="feature-card">
                                <h3>👥 View Users</h3>
                                <p>See all registered users</p>
                                <button className="btn-feature">User List</button>
                            </div>
                            <div className="feature-card">
                                <h3>📊 Statistics</h3>
                                <p>View quiz statistics and results</p>
                                <button className="btn-feature">View Stats</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="feature-card">
                                <h3>🎯 Take a Quiz</h3>
                                <p>Start a new quiz challenge</p>
                                <button className="btn-feature">Start Quiz</button>
                            </div>
                            <div className="feature-card">
                                <h3>📊 My Results</h3>
                                <p>View your quiz history and scores</p>
                                <button className="btn-feature">View Results</button>
                            </div>
                            <div className="feature-card">
                                <h3>🏆 Leaderboard</h3>
                                <p>See top performers</p>
                                <button className="btn-feature">View Rankings</button>
                            </div>
                            <div className="feature-card">
                                <h3>⚙️ Settings</h3>
                                <p>Update your profile</p>
                                <button className="btn-feature">Settings</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
