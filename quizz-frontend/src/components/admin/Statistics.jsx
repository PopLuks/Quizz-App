import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Statistics = () => {
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalQuestions: 0,
        totalUsers: 0,
        activeUsers: 0,
        recentActivity: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: Fetch statistics from backend
        // Mock data
        setStats({
            totalQuizzes: 12,
            totalQuestions: 145,
            totalUsers: 234,
            activeUsers: 189,
            recentActivity: [
                { id: 1, user: 'john_doe', action: 'Completed quiz "JavaScript Basics"', time: '2 hours ago' },
                { id: 2, user: 'jane_smith', action: 'Started quiz "React Advanced"', time: '5 hours ago' },
                { id: 3, user: 'bob_wilson', action: 'Registered new account', time: '1 day ago' }
            ]
        });
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>📊 Statistics</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>{stats.totalQuizzes}</h3>
                        <p>Total Quizzes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">❓</div>
                    <div className="stat-content">
                        <h3>{stats.totalQuestions}</h3>
                        <p>Total Questions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active Users</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {stats.recentActivity.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-content">
                                <strong>{activity.user}</strong>
                                <p>{activity.action}</p>
                            </div>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Statistics;