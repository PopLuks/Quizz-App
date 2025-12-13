import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import Toast from '../Toast';
import './User.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const AvailableQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const stompClientRef = useRef(null);

    useEffect(() => {
        fetchQuizzes();
        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    const connectWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            debug: (str) => console.log('🔌 WebSocket:', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ WebSocket Connected!');
                
                client.subscribe('/topic/quizzes', (message) => {
                    console.log('📢 Quiz update received:', message.body);
                    fetchQuizzes(); // Refresh quiz list automatically
                });

                client.subscribe('/topic/attempts', (message) => {
                    console.log('📢 Attempt update received:', message.body);
                    fetchQuizzes(); // Refresh to update hasAttempted status
                });
            },
            onDisconnect: () => {
                console.log('❌ WebSocket Disconnected');
            },
            onStompError: (frame) => {
                console.error('❌ WebSocket Error:', frame);
            }
        });

        client.activate();
        stompClientRef.current = client;
    };

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await quizAPI.getAllQuizzes();
            console.log('📥 Received quizzes:', response.data);
            // Filter only active quizzes - check both 'active' and 'isActive' for compatibility
            const activeQuizzes = response.data.filter(quiz => quiz.isActive === true || quiz.active === true);
            console.log('✅ Active quizzes:', activeQuizzes);
            setQuizzes(activeQuizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            setToast({ message: 'Failed to load quizzes', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'EASY': return '#4CAF50';
            case 'MEDIUM': return '#FF9800';
            case 'HARD': return '#f44336';
            default: return '#2196F3';
        }
    };

    const startQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };

    const viewResults = (attemptId) => {
        navigate(`/quiz-result/${attemptId}`);
    };

    return (
        <div className="user-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="user-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>🎯 Available Quizzes</h1>
            </div>

            {loading ? (
                <div className="loading">Loading quizzes...</div>
            ) : (
                <div className="quizzes-container">
                    {quizzes.length === 0 ? (
                        <div className="empty-state">
                            <p>No quizzes available at the moment. Check back later!</p>
                        </div>
                    ) : (
                        <div className="quiz-grid">
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="quiz-item">
                                    <div className="quiz-item-header">
                                        <h3>{quiz.title}</h3>
                                        <span 
                                            className="difficulty-badge" 
                                            style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                                        >
                                            {quiz.difficulty}
                                        </span>
                                    </div>
                                    
                                    <p className="quiz-description">{quiz.description}</p>
                                    
                                    <div className="quiz-info">
                                        <div className="info-item">
                                            <span className="info-label">Questions:</span>
                                            <span className="info-value">{quiz.questions?.length || 0}</span>
                                        </div>
                                        {quiz.category && (
                                            <div className="info-item">
                                                <span className="info-label">Category:</span>
                                                <span className="info-value">{quiz.category}</span>
                                            </div>
                                        )}
                                        {quiz.timeLimit > 0 && (
                                            <div className="info-item">
                                                <span className="info-label">Time Limit:</span>
                                                <span className="info-value">{quiz.timeLimit} min</span>
                                            </div>
                                        )}
                                        <div className="info-item">
                                            <span className="info-label">Passing Score:</span>
                                            <span className="info-value">{quiz.passingScore}%</span>
                                        </div>
                                    </div>

                                    {quiz.hasAttempted ? (
                                        <div className="quiz-status-section">
                                            <div className="completed-badge">
                                                ✅ Already Completed
                                            </div>
                                            <button 
                                                className="view-results-btn"
                                                onClick={() => viewResults(quiz.attemptId)}
                                            >
                                                📊 View Results
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            className="start-quiz-btn"
                                            onClick={() => startQuiz(quiz.id)}
                                        >
                                            ▶️ Start Quiz
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AvailableQuizzes;
