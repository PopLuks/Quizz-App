import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizAPI, attemptAPI } from '../../services/api';
import Toast from '../Toast';
import './User.css';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (quizStarted && timeLeft !== null && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [quizStarted, timeLeft]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await quizAPI.getQuizById(id);
            
            // Check if quiz has already been completed
            if (response.data.hasAttempted) {
                setToast({ message: 'You have already completed this quiz', type: 'info' });
                setTimeout(() => navigate(`/quiz-result/${response.data.attemptId}`), 1500);
                return;
            }
            
            setQuiz(response.data);
            if (response.data.timeLimit > 0) {
                setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            setToast({ message: 'Failed to load quiz', type: 'error' });
            setTimeout(() => navigate('/quizzes'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setQuizStartTime(Date.now());
    };

    const handleAnswerSelect = (questionId, answerId) => {
        const question = quiz.questions.find(q => q.id === questionId);
        
        // Check if this is a multiple choice question
        if (question.questionType === 'MULTIPLE_CHOICE') {
            setAnswers(prev => {
                const currentAnswers = prev[questionId] || [];
                
                // If answer already selected, remove it; otherwise add it
                if (currentAnswers.includes(answerId)) {
                    return {
                        ...prev,
                        [questionId]: currentAnswers.filter(id => id !== answerId)
                    };
                } else {
                    return {
                        ...prev,
                        [questionId]: [...currentAnswers, answerId]
                    };
                }
            });
        } else {
            // Single choice - replace the answer
            setAnswers(prev => ({
                ...prev,
                [questionId]: answerId
            }));
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        // Calculate time taken
        const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;

        // Submit to backend
        try {
            console.log('📤 Submitting quiz attempt to backend...');
            console.log('📝 Answers object:', answers);
            console.log('📝 Answers JSON:', JSON.stringify(answers));
            
            const submitData = {
                quizId: quiz.id,
                answers: answers,
                timeTakenSeconds: timeTaken
            };
            
            console.log('📦 Submit data:', submitData);

            const response = await attemptAPI.submitQuiz(submitData);
            console.log('✅ Quiz attempt saved:', response.data);

            // Use data from backend response
            const backendResult = response.data;

            // Navigate to results page with backend data
            navigate('/quiz-result', {
                state: {
                    quiz,
                    answers,
                    correctAnswers: backendResult.correctAnswers,
                    totalQuestions: backendResult.totalQuestions,
                    scorePercentage: Math.round(backendResult.score),
                    earnedPoints: backendResult.earnedPoints,
                    totalPoints: backendResult.totalPoints,
                    passed: backendResult.passed,
                    attemptId: backendResult.id
                }
            });
        } catch (error) {
            console.error('❌ Error submitting quiz:', error);
            setToast({ message: 'Failed to submit quiz. Please try again.', type: 'error' });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="user-page">
                <div className="loading">Loading quiz...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="user-page">
                <div className="error">Quiz not found</div>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="user-page">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                
                <div className="quiz-intro">
                    <h1>{quiz.title}</h1>
                    <p className="quiz-intro-description">{quiz.description}</p>
                    
                    <div className="quiz-intro-info">
                        <div className="intro-info-item">
                            <strong>Total Questions:</strong> {quiz.questions.length}
                        </div>
                        <div className="intro-info-item">
                            <strong>Difficulty:</strong> {quiz.difficulty}
                        </div>
                        {quiz.timeLimit > 0 && (
                            <div className="intro-info-item">
                                <strong>Time Limit:</strong> {quiz.timeLimit} minutes
                            </div>
                        )}
                        <div className="intro-info-item">
                            <strong>Passing Score:</strong> {quiz.passingScore}%
                        </div>
                        {quiz.category && (
                            <div className="intro-info-item">
                                <strong>Category:</strong> {quiz.category}
                            </div>
                        )}
                    </div>

                    <div className="quiz-intro-actions">
                        <button onClick={() => navigate('/quizzes')} className="btn-cancel">
                            Cancel
                        </button>
                        <button onClick={startQuiz} className="btn-start">
                            🚀 Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="user-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="quiz-container">
                <div className="quiz-header-bar">
                    <div className="quiz-progress">
                        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    {timeLeft !== null && (
                        <div className={`quiz-timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
                            ⏱️ {formatTime(timeLeft)}
                        </div>
                    )}
                </div>

                <div className="question-card">
                    <div className="question-header">
                        <h2>Question {currentQuestionIndex + 1}</h2>
                        <span className="question-points">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <p className="question-text">{currentQuestion.questionText}</p>

                    {currentQuestion.questionType === 'MULTIPLE_CHOICE' && (
                        <p className="question-hint">💡 Select all correct answers</p>
                    )}

                    <div className="answer-options">
                        {currentQuestion.answerOptions.map((option) => {
                            const isMultiple = currentQuestion.questionType === 'MULTIPLE_CHOICE';
                            const isSelected = isMultiple 
                                ? (answers[currentQuestion.id] || []).includes(option.id)
                                : answers[currentQuestion.id] === option.id;

                            return (
                                <div 
                                    key={option.id} 
                                    className={`answer-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                >
                                    <input
                                        type={isMultiple ? "checkbox" : "radio"}
                                        name={`question-${currentQuestion.id}`}
                                        checked={isSelected}
                                        onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                    />
                                    <label>{option.optionText}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="quiz-navigation">
                    <button 
                        onClick={handlePrevious} 
                        disabled={currentQuestionIndex === 0}
                        className="btn-nav"
                    >
                        ← Previous
                    </button>
                    
                    <div className="question-indicators">
                        {quiz.questions.map((_, index) => (
                            <span 
                                key={index}
                                className={`indicator ${index === currentQuestionIndex ? 'active' : ''} ${answers[quiz.questions[index].id] ? 'answered' : ''}`}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </span>
                        ))}
                    </div>

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <button onClick={handleNext} className="btn-nav">
                            Next →
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="btn-submit">
                            ✅ Submit Quiz
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeQuiz;
