import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ManageQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: Fetch quizzes from backend
        // For now, mock data
        setQuizzes([
            { id: 1, title: 'JavaScript Basics', questions: 10, createdAt: '2024-11-01' },
            { id: 2, title: 'React Advanced', questions: 15, createdAt: '2024-11-02' }
        ]);
    }, []);

    const handleCreateQuiz = () => {
        // TODO: Navigate to create quiz page
        alert('Create Quiz functionality coming soon!');
    };

    const handleEditQuiz = (quizId) => {
        alert(`Edit quiz ${quizId} - Coming soon!`);
    };

    const handleDeleteQuiz = (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            setQuizzes(quizzes.filter(q => q.id !== quizId));
            alert('Quiz deleted successfully!');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>📝 Manage Quizzes</h1>
                <button onClick={handleCreateQuiz} className="create-btn">
                    + Create New Quiz
                </button>
            </div>

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
                                <span className="quiz-badge">{quiz.questions} questions</span>
                            </div>
                            <p className="quiz-date">Created: {quiz.createdAt}</p>
                            <div className="quiz-actions">
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
        </div>
    );
};

export default ManageQuizzes;