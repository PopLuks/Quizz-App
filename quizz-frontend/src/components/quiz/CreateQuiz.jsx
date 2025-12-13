import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI, questionBankAPI } from '../../services/api';
import Toast from '../Toast';
import './Quiz.css';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);

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

    const openQuestionBank = async () => {
        try {
            const response = await questionBankAPI.getAllQuestions();
            setBankQuestions(response.data);
            setSelectedBankQuestions([]);
            setShowBankModal(true);
        } catch (error) {
            console.error('Error fetching question bank:', error);
            setToast({ message: 'Failed to load question bank', type: 'error' });
        }
    };

    const toggleBankQuestion = (questionId) => {
        setSelectedBankQuestions(prev => 
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const importSelectedQuestions = () => {
        const questionsToImport = bankQuestions
            .filter(q => selectedBankQuestions.includes(q.id))
            .map(q => ({
                questionText: q.questionText,
                questionType: q.questionType,
                points: q.points,
                answerOptions: q.answerOptions.map(opt => ({
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect
                }))
            }));

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, ...questionsToImport]
        }));

        setToast({ message: `Imported ${questionsToImport.length} questions!`, type: 'success' });
        setShowBankModal(false);
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
            setLoading(true);
            console.log('📤 Submitting quiz:', JSON.stringify(quizData, null, 2));
            const response = await quizAPI.createQuiz(quizData);
            console.log('✅ Quiz created:', response.data);
            
            setToast({ message: 'Quiz created successfully!', type: 'success' });
            
            setTimeout(() => {
                navigate('/admin/quizzes');
            }, 1500);
        } catch (error) {
            console.error('❌ Error creating quiz:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
            
            let errorMessage = 'Failed to create quiz';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }
            
            setToast({ 
                message: errorMessage, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-quiz-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="quiz-header">
                <button onClick={() => navigate('/admin/quizzes')} className="back-btn">
                    ← Back to Quizzes
                </button>
                <h1>📝 Create New Quiz</h1>
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
                    <div className="section-header">
                        <h2>Add Questions</h2>
                        <button type="button" onClick={openQuestionBank} className="import-bank-btn">
                            🏦 Import from Question Bank
                        </button>
                    </div>
                    
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
                                <option value="SINGLE_ANSWER">Single Answer</option>
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
                        <label className="section-label">Answer Options *</label>
                        <div className="options-list">
                            {currentQuestion.answerOptions.map((option, index) => (
                                <div key={index} className={`option-card ${option.isCorrect ? 'correct' : ''}`}>
                                    <div className="option-header">
                                        <span className="option-number">Option {index + 1}</span>
                                        {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                                    </div>
                                    <div className="option-content">
                                        <input
                                            type="text"
                                            value={option.optionText}
                                            onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                                            placeholder="Enter answer option..."
                                            className="option-input-field"
                                        />
                                        <div className="option-actions">
                                            <label className="correct-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                                />
                                                <span>Mark as correct</span>
                                            </label>
                                            {currentQuestion.answerOptions.length > 2 && (
                                                <button type="button" onClick={() => removeOption(index)} className="remove-option-btn">
                                                    ✕ Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addOption} className="add-option-btn">
                            + Add Another Option
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
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Creating...' : '✅ Create Quiz'}
                    </button>
                </div>
            </form>

            {/* Question Bank Modal */}
            {showBankModal && (
                <div className="modal-overlay" onClick={() => setShowBankModal(false)}>
                    <div className="modal-content question-bank-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🏦 Question Bank</h2>
                            <button onClick={() => setShowBankModal(false)} className="close-btn">×</button>
                        </div>
                        
                        <div className="bank-questions-list">
                            {bankQuestions.length === 0 ? (
                                <p className="no-questions">No questions in the bank yet.</p>
                            ) : (
                                bankQuestions.map(q => (
                                    <div key={q.id} className="bank-question-item">
                                        <label className="bank-question-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedBankQuestions.includes(q.id)}
                                                onChange={() => toggleBankQuestion(q.id)}
                                            />
                                            <div className="bank-question-content">
                                                <h4>{q.questionText}</h4>
                                                <div className="bank-question-meta">
                                                    <span className="badge">{q.category || 'Uncategorized'}</span>
                                                    <span className={`badge difficulty-${q.difficulty.toLowerCase()}`}>
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="badge">Points: {q.points}</span>
                                                </div>
                                                <div className="bank-options-preview">
                                                    {q.answerOptions.map((opt, idx) => (
                                                        <span key={idx} className={`mini-option ${opt.isCorrect ? 'correct' : ''}`}>
                                                            {opt.isCorrect && '✓ '}{opt.optionText}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowBankModal(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button 
                                onClick={importSelectedQuestions} 
                                className="submit-btn"
                                disabled={selectedBankQuestions.length === 0}
                            >
                                Import {selectedBankQuestions.length} Question{selectedBankQuestions.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateQuiz;