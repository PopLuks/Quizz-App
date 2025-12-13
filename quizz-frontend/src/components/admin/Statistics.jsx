import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsAPI } from '../../services/api';
import './Admin.css';

const Statistics = () => {
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        totalQuestions: 0,
        totalUsers: 0,
        totalAttempts: 0,
        activeUsers: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const response = await statisticsAPI.getStatistics();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading">Loading statistics...</div>
            </div>
        );
    }

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
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{stats.totalAttempts}</h3>
                        <p>Quiz Attempts</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active Users (7d)</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-content">
                                    <strong>{activity.user}</strong>
                                    <p>{activity.action}</p>
                                </div>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no-activity">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;