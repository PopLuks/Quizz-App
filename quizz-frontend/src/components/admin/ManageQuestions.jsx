import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: Fetch questions from backend
        // Mock data
        setQuestions([
            {
                id: 1,
                quiz: 'JavaScript Basics',
                question: 'What is a closure?',
                type: 'Multiple Choice',
                difficulty: 'Medium'
            },
            {
                id: 2,
                quiz: 'React Advanced',
                question: 'What are React Hooks?',
                type: 'Multiple Choice',
                difficulty: 'Hard'
            }
        ]);
    }, []);

    const handleAddQuestion = () => {
        alert('Add Question functionality coming soon!');
    };

    const handleEditQuestion = (questionId) => {
        alert(`Edit question ${questionId} - Coming soon!`);
    };

    const handleDeleteQuestion = (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            setQuestions(questions.filter(q => q.id !== questionId));
            alert('Question deleted successfully!');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>❓ Manage Questions</h1>
                <button onClick={handleAddQuestion} className="create-btn">
                    + Add New Question
                </button>
            </div>

            <div className="questions-list">
                {questions.length === 0 ? (
                    <div className="empty-state">
                        <p>No questions yet. Add your first question!</p>
                    </div>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="question-card">
                            <div className="question-header">
                                <div>
                                    <h3>{q.question}</h3>
                                    <p className="question-meta">
                                        Quiz: {q.quiz} | Type: {q.type} | Difficulty: 
                                        <span className={`difficulty ${q.difficulty.toLowerCase()}`}>
                                            {q.difficulty}
                                        </span>
                                    </p>
                                </div>
                                <div className="question-actions">
                                    <button onClick={() => handleEditQuestion(q.id)} className="edit-btn-small">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="delete-btn-small">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageQuestions;