import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attemptAPI, quizAPI } from '../../services/api';
import Toast from '../Toast';
import './User.css';

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
                    <h2>Quiz Information</h2>
                    <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '15px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <p><strong>Quiz Title:</strong> {quiz.title}</p>
                        <p><strong>Description:</strong> {quiz.description}</p>
                        <p><strong>Difficulty:</strong> {quiz.difficulty}</p>
                        {attempt.timeTakenSeconds && (
                            <p><strong>Time Taken:</strong> {Math.floor(attempt.timeTakenSeconds / 60)}:{(attempt.timeTakenSeconds % 60).toString().padStart(2, '0')}</p>
                        )}
                        <p><strong>Completed At:</strong> {new Date(attempt.completedAt).toLocaleString()}</p>
                    </div>
                </div>

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
