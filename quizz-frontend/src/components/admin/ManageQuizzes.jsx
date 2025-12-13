import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import Toast from '../Toast';
import './Admin.css';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
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
                console.log('✅ Admin WebSocket Connected!');
                
                client.subscribe('/topic/quizzes', (message) => {
                    console.log('📢 Quiz update received:', message.body);
                    fetchQuizzes(); // Refresh quiz list automatically
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
            const response = await quizAPI.getMyQuizzes();
            setQuizzes(response.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            showToast('Failed to load quizzes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleCreateQuiz = () => {
        navigate('/admin/quizzes/create');
    };

    const handleEditQuiz = (quizId) => {
        navigate(`/admin/quizzes/edit/${quizId}`);
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await quizAPI.deleteQuiz(quizId);
                setQuizzes(quizzes.filter(q => q.id !== quizId));
                showToast('Quiz deleted successfully!', 'success');
            } catch (error) {
                console.error('Error deleting quiz:', error);
                showToast('Failed to delete quiz', 'error');
            }
        }
    };

    const handleToggleStatus = async (quizId) => {
        try {
            const response = await quizAPI.toggleQuizStatus(quizId);
            setQuizzes(quizzes.map(q => q.id === quizId ? response.data : q));
            showToast('Quiz status updated successfully!', 'success');
        } catch (error) {
            console.error('Error toggling quiz status:', error);
            showToast('Failed to update quiz status', 'error');
        }
    };

    return (
        <div className="admin-page">
            {toast.show && <Toast message={toast.message} type={toast.type} />}
            
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>📝 Manage Quizzes</h1>
                <button onClick={handleCreateQuiz} className="create-btn">
                    + Create New Quiz
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading quizzes...</div>
            ) : (
                <div className="quizzes-grid">
                    {quizzes.length === 0 ? (
                        <div className="empty-state">
                            <p>No quizzes yet. Create your first quiz!</p>
                        </div>
                    ) : (
                        quizzes.map(quiz => (
                            <div key={quiz.id} className="quiz-card">
                                <div className="quiz-header">
                                    <h3>{quiz.title}</h3>
                                    <span className="quiz-badge">
                                        {quiz.questions?.length || 0} questions
                                    </span>
                                </div>
                                <p className="quiz-description">{quiz.description}</p>
                                <div className="quiz-meta">
                                    <span className={`status-badge ${quiz.isActive ? 'active' : 'inactive'}`}>
                                        {quiz.isActive ? '✓ Active' : '✗ Inactive'}
                                    </span>
                                    <span className="quiz-date">
                                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="quiz-actions">
                                    <button 
                                        onClick={() => handleToggleStatus(quiz.id)} 
                                        className={quiz.isActive ? 'deactivate-btn' : 'activate-btn'}
                                    >
                                        {quiz.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                                    </button>
                                    <button onClick={() => handleEditQuiz(quiz.id)} className="edit-btn">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="delete-btn">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageQuizzes;