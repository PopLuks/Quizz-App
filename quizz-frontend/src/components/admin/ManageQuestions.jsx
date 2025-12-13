import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionBankAPI } from '../../services/api';
import Toast from '../Toast';
import './Admin.css';

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [filterDifficulty, setFilterDifficulty] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        category: '',
        points: 1,
        answerOptions: [
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await questionBankAPI.getAllQuestions();
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
            showToast('Failed to load questions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const resetForm = () => {
        setFormData({
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            difficulty: 'MEDIUM',
            category: '',
            points: 1,
            answerOptions: [
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false }
            ]
        });
        setEditingQuestion(null);
    };

    const handleAddQuestion = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setFormData({
            questionText: question.questionText,
            questionType: question.questionType,
            difficulty: question.difficulty,
            category: question.category || '',
            points: question.points,
            answerOptions: question.answerOptions.map(opt => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
            }))
        });
        setShowModal(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question from the bank?')) {
            try {
                await questionBankAPI.deleteQuestion(questionId);
                showToast('Question deleted successfully!', 'success');
                fetchQuestions();
            } catch (error) {
                console.error('Error deleting question:', error);
                showToast('Failed to delete question', 'error');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'points' ? parseInt(value) || 1 : value
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.answerOptions];
        newOptions[index][field] = value;
        setFormData(prev => ({
            ...prev,
            answerOptions: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            answerOptions: [...prev.answerOptions, { optionText: '', isCorrect: false }]
        }));
    };

    const removeOption = (index) => {
        if (formData.answerOptions.length > 2) {
            setFormData(prev => ({
                ...prev,
                answerOptions: prev.answerOptions.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.questionText.trim()) {
            showToast('Please enter a question text', 'error');
            return;
        }

        const hasCorrectAnswer = formData.answerOptions.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
            showToast('Please mark at least one correct answer', 'error');
            return;
        }

        try {
            if (editingQuestion) {
                await questionBankAPI.updateQuestion(editingQuestion.id, formData);
                showToast('Question updated successfully!', 'success');
            } else {
                await questionBankAPI.createQuestion(formData);
                showToast('Question added to bank!', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchQuestions();
        } catch (error) {
            console.error('Error saving question:', error);
            showToast('Failed to save question', 'error');
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesDifficulty = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
        const matchesCategory = !filterCategory || q.category?.toLowerCase().includes(filterCategory.toLowerCase());
        return matchesDifficulty && matchesCategory;
    });

    return (
        <div className="admin-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="admin-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
                <h1>🏦 Question Bank</h1>
                <button onClick={handleAddQuestion} className="create-btn">
                    + Add Question to Bank
                </button>
            </div>

            <div className="filters">
                <select 
                    value={filterDifficulty} 
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="filter-select"
                >
                    <option value="ALL">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
                <input
                    type="text"
                    placeholder="Filter by category..."
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-input"
                />
            </div>

            {loading ? (
                <div className="loading">Loading questions...</div>
            ) : (
                <div className="questions-list">
                    {filteredQuestions.length === 0 ? (
                        <div className="empty-state">
                            <p>No questions in the bank yet. Add your first reusable question!</p>
                        </div>
                    ) : (
                        filteredQuestions.map(q => (
                            <div key={q.id} className="question-card">
                                <div className="question-header">
                                    <div>
                                        <h3>{q.questionText}</h3>
                                        <p className="question-meta">
                                            Category: {q.category || 'Uncategorized'} | 
                                            Type: {q.questionType.replace('_', ' ')} | 
                                            Points: {q.points} |
                                            Difficulty: <span className={`difficulty ${q.difficulty.toLowerCase()}`}>
                                                {q.difficulty}
                                            </span>
                                        </p>
                                        <div className="answer-options-preview">
                                            {q.answerOptions.map((opt, idx) => (
                                                <div key={idx} className={`option-preview ${opt.isCorrect ? 'correct' : ''}`}>
                                                    {opt.isCorrect && '✓ '}{opt.optionText}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="question-actions">
                                        <button onClick={() => handleEditQuestion(q)} className="edit-btn-small">
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
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingQuestion ? 'Edit Question' : 'Add Question to Bank'}</h2>
                            <button onClick={() => setShowModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="question-form">
                            <div className="form-group">
                                <label>Question Text *</label>
                                <textarea
                                    name="questionText"
                                    value={formData.questionText}
                                    onChange={handleFormChange}
                                    placeholder="Enter your question..."
                                    required
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        placeholder="e.g., JavaScript, React, Python"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Question Type *</label>
                                    <select name="questionType" value={formData.questionType} onChange={handleFormChange}>
                                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                        <option value="SINGLE_ANSWER">Single Answer</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Difficulty *</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleFormChange}>
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Points *</label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleFormChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Answer Options *</label>
                                {formData.answerOptions.map((option, index) => (
                                    <div key={index} className="option-input">
                                        <input
                                            type="text"
                                            value={option.optionText}
                                            onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            required
                                        />
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                            />
                                            Correct
                                        </label>
                                        {formData.answerOptions.length > 2 && (
                                            <button type="button" onClick={() => removeOption(index)} className="remove-option-btn">
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addOption} className="add-option-btn">
                                    + Add Option
                                </button>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    {editingQuestion ? 'Update Question' : 'Add to Bank'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageQuestions;