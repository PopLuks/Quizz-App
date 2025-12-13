import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import './Quiz.css';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            console.log('🔄 Fetching quizzes... Is Admin:', isAdmin);
            setLoading(true);
            
            const response = isAdmin 
                ? await quizAPI.getMyQuizzes() 
                : await quizAPI.getAllQuizzes();
            
            console.log('✅ Quizzes received:', response.data);
            setQuizzes(response.data);
        } catch (error) {
            console.error('❌ Error fetching quizzes:', error);
            console.error('Error details:', error.response);
            setToast({ 
                message: 'Failed to load quizzes. Please try again.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (quizId) => {
        try {
            console.log('🔄 Toggling quiz status:', quizId);
            const response = await quizAPI.toggleQuizStatus(quizId);
            
            console.log('✅ Toggle response:', response.data);
            
            setQuizzes(prevQuizzes => 
                prevQuizzes.map(q => 
                    q.id === quizId ? response.data : q
                )
            );
            
            setToast({ 
                message: `Quiz ${response.data.isActive ? 'activated' : 'deactivated'} successfully!`, 
                type: 'success' 
            });
        } catch (error) {
            console.error('❌ Error toggling quiz status:', error);
            setToast({ 
                message: 'Failed to update quiz status.', 
                type: 'error' 
            });
        }
    };

    const handleDeleteQuiz = async (quizId, quizTitle) => {
        if (window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
            try {
                console.log('🗑️ Deleting quiz:', quizId);
                await quizAPI.deleteQuiz(quizId);
                
                setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizId));
                
                setToast({ 
                    message: 'Quiz deleted successfully!', 
                    type: 'success' 
                });
            } catch (error) {
                console.error('❌ Error deleting quiz:', error);
                setToast({ 
                    message: 'Failed to delete quiz.', 
                    type: 'error' 
                });
            }
        }
    };

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return 'medium';
        switch(difficulty.toUpperCase()) {
            case 'EASY': return 'easy';
            case 'MEDIUM': return 'medium';
            case 'HARD': return 'hard';
            default: return 'medium';
        }
    };

    if (loading) {
        return (
            <div className="quiz-list-page">
                <div className="loading-spinner">Loading quizzes...</div>
            </div>
        );
    }

    return (
        <div className="quiz-list-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="quiz-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>📚 {isAdmin ? 'My Quizzes' : 'Available Quizzes'}</h1>
                {isAdmin && (
                    <button onClick={() => navigate('/admin/quizzes/create')} className="create-quiz-btn">
                        ➕ Create New Quiz
                    </button>
                )}
            </div>

            <div className="quiz-stats">
                <p>Total Quizzes: <strong>{quizzes.length}</strong></p>
            </div>

            {quizzes.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No quizzes found</p>
                    {isAdmin && (
                        <button onClick={() => navigate('/admin/quizzes/create')} className="create-quiz-btn">
                            Create Your First Quiz
                        </button>
                    )}
                </div>
            ) : (
                <div className="quizzes-grid">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="quiz-card">
                            <div className="quiz-card-header">
                                <h3>{quiz.title || 'Untitled Quiz'}</h3>
                                <span className={`difficulty-badge ${getDifficultyColor(quiz.difficulty)}`}>
                                    {quiz.difficulty || 'MEDIUM'}
                                </span>
                            </div>

                            <p className="quiz-description">
                                {quiz.description || 'No description available'}
                            </p>

                            <div className="quiz-meta">
                                <span>📁 {quiz.category || 'Uncategorized'}</span>
                                <span>❓ {quiz.questions?.length || 0} Questions</span>
                                <span>⏱️ {quiz.timeLimit === 0 ? 'No limit' : `${quiz.timeLimit} min`}</span>
                                <span>🎯 {quiz.passingScore || 70}% to pass</span>
                            </div>

                            <div className="quiz-status">
                                <span className={`status-badge ${quiz.isActive ? 'active' : 'inactive'}`}>
                                    {quiz.isActive ? '✅ Active' : '🔒 Inactive'}
                                </span>
                            </div>

                            <div className="quiz-actions">
                                {isAdmin ? (
                                    <>
                                        <button 
                                            onClick={() => handleToggleStatus(quiz.id)} 
                                            className="toggle-btn"
                                        >
                                            {quiz.isActive ? '🔒 Deactivate' : '✅ Activate'}
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/quizzes/${quiz.id}`)} 
                                            className="view-btn"
                                        >
                                            👁️ View
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)} 
                                            className="delete-btn-small"
                                        >
                                            🗑️
                                        </button>
                                    </>
                                ) : (
                                    quiz.isActive && (
                                        <button 
                                            onClick={() => navigate(`/quiz/${quiz.id}`)} 
                                            className="take-quiz-btn"
                                        >
                                            🎯 Take Quiz
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;