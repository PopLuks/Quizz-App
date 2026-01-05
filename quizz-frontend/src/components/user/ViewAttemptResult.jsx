import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attemptAPI, quizAPI } from '../../services/api';
import Toast from '../Toast';
import './User.css';
import './ViewAttemptResult.css';

const ViewAttemptResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAttemptData();
    }, [attemptId]);

    const fetchAttemptData = async () => {
        try {
            setLoading(true);
            
            // Fetch attempt details
            const attemptResponse = await attemptAPI.getAttemptById(attemptId);
            const attemptData = attemptResponse.data;
            setAttempt(attemptData);
            
            // Fetch quiz details
            const quizResponse = await quizAPI.getQuizById(attemptData.quizId);
            setQuiz(quizResponse.data);
            
        } catch (error) {
            console.error('Error fetching attempt data:', error);
            setToast({ message: 'Failed to load quiz results', type: 'error' });
            setTimeout(() => navigate('/quizzes'), 2000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="user-page">
                <div className="loading">Loading results...</div>
            </div>
        );
    }

    if (!attempt || !quiz) {
        return (
            <div className="user-page">
                <div className="error">Results not found</div>
                <button onClick={() => navigate('/quizzes')} className="btn-primary">
                    Back to Quizzes
                </button>
            </div>
        );
    }

    const scorePercentage = Math.round(attempt.score);

    return (
        <div className="user-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="result-container">
                <div className={`result-header ${attempt.passed ? 'passed' : 'failed'}`}>
                    <div className="result-icon">
                        {attempt.passed ? '🎉' : '📚'}
                    </div>
                    <h1>{attempt.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}</h1>
                    <p className="result-message">
                        {attempt.passed 
                            ? 'Great job! You passed this quiz.' 
                            : 'You need more practice to pass this quiz.'}
                    </p>
                </div>

                <div className="result-stats">
                    <div className="stat-card">
                        <div className="stat-value">{scorePercentage}%</div>
                        <div className="stat-label">Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{attempt.correctAnswers}/{attempt.totalQuestions}</div>
                        <div className="stat-label">Correct Answers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{attempt.earnedPoints}/{attempt.totalPoints}</div>
                        <div className="stat-label">Points Earned</div>
                    </div>
                </div>

                <div className="result-details">
                    <h2>📋 Quiz Information</h2>
                    <div className="quiz-info-card">
                        <div className="info-row">
                            <div className="info-icon">📝</div>
                            <div className="info-content">
                                <span className="info-title">Quiz Title</span>
                                <span className="info-text">{quiz.title}</span>
                            </div>
                        </div>
                        <div className="info-row">
                            <div className="info-icon">💬</div>
                            <div className="info-content">
                                <span className="info-title">Description</span>
                                <span className="info-text">{quiz.description}</span>
                            </div>
                        </div>
                        <div className="info-row">
                            <div className="info-icon">⚡</div>
                            <div className="info-content">
                                <span className="info-title">Difficulty</span>
                                <span 
                                    className="difficulty-badge-inline"
                                    style={{ 
                                        backgroundColor: quiz.difficulty === 'EASY' ? '#4CAF50' : 
                                                       quiz.difficulty === 'MEDIUM' ? '#FF9800' : '#f44336'
                                    }}
                                >
                                    {quiz.difficulty}
                                </span>
                            </div>
                        </div>
                        {attempt.timeTakenSeconds && (
                            <div className="info-row">
                                <div className="info-icon">⏱️</div>
                                <div className="info-content">
                                    <span className="info-title">Time Taken</span>
                                    <span className="info-text">
                                        {Math.floor(attempt.timeTakenSeconds / 60)}:{(attempt.timeTakenSeconds % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="info-row">
                            <div className="info-icon">📅</div>
                            <div className="info-content">
                                <span className="info-title">Completed At</span>
                                <span className="info-text">{new Date(attempt.completedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {attempt.userAnswers && attempt.userAnswers.length > 0 && (
                    <div className="result-details">
                        <h2>📝 Question Review</h2>
                        <div className="questions-review-container">
                            {attempt.userAnswers.map((userAnswer, index) => (
                                <div 
                                    key={index} 
                                    className={`question-review-card ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}
                                >
                                    <div className="question-review-header">
                                        <span className="question-number">Question {index + 1}</span>
                                        <span className={`question-status ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                                            {userAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                        </span>
                                    </div>
                                    <div className="question-text">{userAnswer.questionText}</div>
                                    
                                    <div className="answer-review">
                                        <div className="answer-section">
                                            <strong className="answer-label your-answer-label">Your Answer:</strong>
                                            <div className={`option-review ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                                                {userAnswer.selectedOptionText}
                                                <span className="option-icon">
                                                    {userAnswer.isCorrect ? '✓' : '✗'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {!userAnswer.isCorrect && (
                                            <div className="answer-section">
                                                <strong className="answer-label correct-answer-label">Correct Answer:</strong>
                                                <div className="option-review correct">
                                                    {userAnswer.correctOptionText}
                                                    <span className="option-icon">✓</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="question-points">
                                        Points: {userAnswer.pointsEarned}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="result-actions">
                    <button onClick={() => navigate('/quizzes')} className="btn-secondary">
                        Back to Quizzes
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary">
                        Go to Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAttemptResult;
