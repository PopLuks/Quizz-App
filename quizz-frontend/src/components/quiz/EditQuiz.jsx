import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import Toast from '../Toast';
import './Quiz.css';

const EditQuiz = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: 'MEDIUM',
        timeLimit: 0,
        passingScore: 70,
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        points: 1,
        answerOptions: [
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false }
        ]
    });

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await quizAPI.getQuizById(id);
            setQuizData(response.data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setToast({ message: 'Failed to load quiz', type: 'error' });
            setTimeout(() => navigate('/admin/quizzes'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizChange = (e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({
            ...prev,
            [name]: name === 'timeLimit' || name === 'passingScore' ? (parseInt(value) || 0) : value
        }));
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({
            ...prev,
            [name]: name === 'points' ? (parseInt(value) || 1) : value
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...currentQuestion.answerOptions];
        newOptions[index][field] = value;
        setCurrentQuestion(prev => ({
            ...prev,
            answerOptions: newOptions
        }));
    };

    const addOption = () => {
        setCurrentQuestion(prev => ({
            ...prev,
            answerOptions: [...prev.answerOptions, { optionText: '', isCorrect: false }]
        }));
    };

    const removeOption = (index) => {
        if (currentQuestion.answerOptions.length > 2) {
            const newOptions = currentQuestion.answerOptions.filter((_, i) => i !== index);
            setCurrentQuestion(prev => ({
                ...prev,
                answerOptions: newOptions
            }));
        }
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            setToast({ message: 'Please enter a question text', type: 'error' });
            return;
        }

        const hasCorrectAnswer = currentQuestion.answerOptions.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
            setToast({ message: 'Please mark at least one correct answer', type: 'error' });
            return;
        }

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, { ...currentQuestion }]
        }));

        // Reset current question
        setCurrentQuestion({
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            points: 1,
            answerOptions: [
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false }
            ]
        });

        setToast({ message: 'Question added!', type: 'success' });
    };

    const removeQuestion = (index) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!quizData.title.trim()) {
            setToast({ message: 'Please enter a quiz title', type: 'error' });
            return;
        }

        if (quizData.questions.length === 0) {
            setToast({ message: 'Please add at least one question', type: 'error' });
            return;
        }

        try {
            setSaving(true);
            console.log('📤 Updating quiz:', quizData);
            const response = await quizAPI.updateQuiz(id, quizData);
            console.log('✅ Quiz updated:', response.data);
            
            setToast({ message: 'Quiz updated successfully!', type: 'success' });
            
            setTimeout(() => {
                navigate('/admin/quizzes');
            }, 1500);
        } catch (error) {
            console.error('❌ Error updating quiz:', error);
            setToast({ 
                message: error.response?.data?.message || 'Failed to update quiz', 
                type: 'error' 
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="create-quiz-page">
                <div className="loading">Loading quiz...</div>
            </div>
        );
    }

    return (
        <div className="create-quiz-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="quiz-header">
                <button onClick={() => navigate('/admin/quizzes')} className="back-btn">
                    ← Back to Quizzes
                </button>
                <h1>✏️ Edit Quiz</h1>
            </div>

            <form onSubmit={handleSubmit} className="quiz-form">
                {/* Quiz Details */}
                <div className="form-section">
                    <h2>Quiz Details</h2>
                    
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={quizData.title}
                            onChange={handleQuizChange}
                            placeholder="Enter quiz title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={quizData.description}
                            onChange={handleQuizChange}
                            placeholder="Enter quiz description"
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                value={quizData.category}
                                onChange={handleQuizChange}
                                placeholder="e.g. Math, Science, History"
                            />
                        </div>

                        <div className="form-group">
                            <label>Difficulty</label>
                            <select name="difficulty" value={quizData.difficulty} onChange={handleQuizChange}>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Time Limit (minutes, 0 = unlimited)</label>
                            <input
                                type="number"
                                name="timeLimit"
                                value={quizData.timeLimit}
                                onChange={handleQuizChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Passing Score (%)</label>
                            <input
                                type="number"
                                name="passingScore"
                                value={quizData.passingScore}
                                onChange={handleQuizChange}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>

                {/* Current Question */}
                <div className="form-section">
                    <h2>Add Question</h2>
                    
                    <div className="form-group">
                        <label>Question Text *</label>
                        <textarea
                            name="questionText"
                            value={currentQuestion.questionText}
                            onChange={handleQuestionChange}
                            placeholder="Enter your question"
                            rows="2"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Question Type</label>
                            <select name="questionType" value={currentQuestion.questionType} onChange={handleQuestionChange}>
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="TRUE_FALSE">True/False</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Points</label>
                            <input
                                type="number"
                                name="points"
                                value={currentQuestion.points}
                                onChange={handleQuestionChange}
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Answer Options */}
                    <div className="options-section">
                        <label>Answer Options *</label>
                        {currentQuestion.answerOptions.map((option, index) => (
                            <div key={index} className="option-row">
                                <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                    title="Mark as correct answer"
                                />
                                <input
                                    type="text"
                                    value={option.optionText}
                                    onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="option-input"
                                />
                                {currentQuestion.answerOptions.length > 2 && (
                                    <button type="button" onClick={() => removeOption(index)} className="remove-option-btn">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="add-option-btn">
                            + Add Option
                        </button>
                    </div>

                    <button type="button" onClick={addQuestion} className="add-question-btn">
                        ➕ Add Question to Quiz
                    </button>
                </div>

                {/* Questions List */}
                {quizData.questions.length > 0 && (
                    <div className="form-section">
                        <h2>Questions ({quizData.questions.length})</h2>
                        <div className="questions-list">
                            {quizData.questions.map((q, index) => (
                                <div key={index} className="question-item">
                                    <div className="question-header">
                                        <span className="question-number">Q{index + 1}</span>
                                        <span className="question-points">{q.points} pts</span>
                                        <button type="button" onClick={() => removeQuestion(index)} className="remove-question-btn">
                                            🗑️ Remove
                                        </button>
                                    </div>
                                    <p className="question-text">{q.questionText}</p>
                                    <div className="question-options">
                                        {q.answerOptions.map((opt, i) => (
                                            <div key={i} className={`option ${opt.isCorrect ? 'correct' : ''}`}>
                                                {opt.isCorrect && '✓ '}
                                                {opt.optionText}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/quizzes')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="submit-btn">
                        {saving ? 'Saving...' : '💾 Update Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditQuiz;
