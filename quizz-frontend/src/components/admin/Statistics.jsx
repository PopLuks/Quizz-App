import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsAPI, adminAPI, attemptAPI } from '../../services/api';
import './Admin.css';
import './Statistics.css';

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
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userAttempts, setUserAttempts] = useState([]);
    const [expandedAttemptId, setExpandedAttemptId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStatistics();
        fetchUsers();
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

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getAllUsers();
            setUsers(response.data.filter(user => user.role === 'USER'));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserSelect = async (userId) => {
        if (selectedUserId === userId) {
            setSelectedUserId(null);
            setUserAttempts([]);
            return;
        }

        setSelectedUserId(userId);
        setExpandedAttemptId(null);
        
        try {
            const response = await adminAPI.getUserAttempts(userId);
            setUserAttempts(response.data);
        } catch (error) {
            console.error('Error fetching user attempts:', error);
            setUserAttempts([]);
        }
    };

    const toggleAttemptDetails = (attemptId) => {
        if (expandedAttemptId === attemptId) {
            setExpandedAttemptId(null);
        } else {
            setExpandedAttemptId(attemptId);
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

            {/* Student Results Section */}
            <div className="student-results-section">
                <h2>📚 Student Results</h2>
                <div className="students-list">
                    {users.length === 0 ? (
                        <p className="no-students">No students found</p>
                    ) : (
                        users.map(user => (
                            <div key={user.id} className="student-card">
                                <div 
                                    className="student-header"
                                    onClick={() => handleUserSelect(user.id)}
                                >
                                    <div className="student-info">
                                        <span className="student-icon">👤</span>
                                        <div>
                                            <h3>{user.username}</h3>
                                            <p>{user.email}</p>
                                        </div>
                                    </div>
                                    <button className="expand-btn">
                                        {selectedUserId === user.id ? '▲' : '▼'}
                                    </button>
                                </div>

                                {selectedUserId === user.id && (
                                    <div className="student-attempts">
                                        {userAttempts.length === 0 ? (
                                            <p className="no-attempts">No quiz attempts yet</p>
                                        ) : (
                                            userAttempts.map(attempt => (
                                                <div key={attempt.id} className="attempt-card">
                                                    <div className="attempt-header">
                                                        <div className="attempt-info">
                                                            <h4>{attempt.quizTitle}</h4>
                                                            <div className="attempt-meta">
                                                                <span className={`score-badge ${attempt.passed ? 'passed' : 'failed'}`}>
                                                                    {Math.round(attempt.score)}%
                                                                </span>
                                                                <span className="attempt-date">
                                                                    {new Date(attempt.completedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="view-questions-btn"
                                                            onClick={() => toggleAttemptDetails(attempt.id)}
                                                        >
                                                            {expandedAttemptId === attempt.id ? 'Hide Questions' : 'View Questions'}
                                                        </button>
                                                    </div>

                                                    {expandedAttemptId === attempt.id && attempt.userAnswers && (
                                                        <div className="questions-detail">
                                                            {attempt.userAnswers.map((answer, index) => (
                                                                <div 
                                                                    key={index}
                                                                    className={`question-detail ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                                                                >
                                                                    <div className="question-detail-header">
                                                                        <span className="q-number">Q{index + 1}</span>
                                                                        <span className={`q-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                                                            {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="q-text">{answer.questionText}</p>
                                                                    <div className="q-answers">
                                                                        <div className="q-answer-item">
                                                                            <strong>Student Answer:</strong>
                                                                            <div className={`q-answer-box ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                                                                                {answer.selectedOptionText}
                                                                            </div>
                                                                        </div>
                                                                        {!answer.isCorrect && (
                                                                            <div className="q-answer-item">
                                                                                <strong>Correct Answer:</strong>
                                                                                <div className="q-answer-box correct">
                                                                                    {answer.correctOptionText}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="q-points">Points: {answer.pointsEarned}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistics;