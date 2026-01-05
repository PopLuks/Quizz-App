import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptAPI, quizAPI } from '../../services/api';
import Toast from '../Toast';
import './User.css';
import './MyResults.css';

const MyResults = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState('all'); // all, completed, pending
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [quizDetails, setQuizDetails] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attemptsResponse, quizzesResponse] = await Promise.all([
                attemptAPI.getMyAttempts(),
                quizAPI.getAllQuizzes()
            ]);
            
            console.log('Attempts Response:', attemptsResponse);
            console.log('Quizzes Response:', quizzesResponse);
            
            const attemptsData = attemptsResponse.data;
            const quizzesData = quizzesResponse.data;
            
            console.log('Attempts Data:', attemptsData);
            console.log('Quizzes Data:', quizzesData);
            
            setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
            setAllQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setToast({ 
                message: 'Failed to load results: ' + (error.response?.data?.message || error.message), 
                type: 'error' 
            });
            setAttempts([]);
            setAllQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const getQuizAttempt = (quizId) => {
        return Array.isArray(attempts) ? attempts.find(attempt => attempt.quizId === quizId) : null;
    };

    const getFilteredQuizzes = () => {
        if (!Array.isArray(allQuizzes)) return [];
        
        if (filter === 'completed') {
            return allQuizzes.filter(quiz => getQuizAttempt(quiz.id));
        } else if (filter === 'pending') {
            return allQuizzes.filter(quiz => !getQuizAttempt(quiz.id));
        }
        return allQuizzes;
    };

    const completedCount = Array.isArray(allQuizzes) ? allQuizzes.filter(quiz => getQuizAttempt(quiz.id)).length : 0;
    const pendingCount = Array.isArray(allQuizzes) ? allQuizzes.length - completedCount : 0;
    const averageScore = Array.isArray(attempts) && attempts.length > 0 
        ? (attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length).toFixed(1)
        : 0;

    const toggleQuizDetails = async (quizId, attemptId) => {
        if (expandedQuizId === quizId) {
            setExpandedQuizId(null);
            return;
        }

        if (!quizDetails[quizId]) {
            try {
                const [attemptResponse, quizResponse] = await Promise.all([
                    attemptAPI.getAttemptById(attemptId),
                    quizAPI.getQuizById(quizId)
                ]);
                
                setQuizDetails(prev => ({
                    ...prev,
                    [quizId]: {
                        attempt: attemptResponse.data,
                        quiz: quizResponse.data
                    }
                }));
            } catch (error) {
                console.error('Error fetching quiz details:', error);
                setToast({ message: 'Failed to load question details', type: 'error' });
                return;
            }
        }
        
        setExpandedQuizId(quizId);
    };

    if (loading) {
        return (
            <div className="user-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading your results...</p>
                </div>
            </div>
        );
    }

    const filteredQuizzes = getFilteredQuizzes();

    return (
        <div className="user-container my-results-page">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className="page-header-results">
                <div className="header-content">
                    <h1 className="page-title-results">📊 My Quiz Results</h1>
                    <p className="page-subtitle">Track your progress and achievements</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn-back-modern">
                    <span className="back-icon">←</span>
                    <span>Dashboard</span>
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-overview-modern">
                <div className="stat-card-modern stat-total">
                    <div className="stat-icon-modern">📚</div>
                    <div className="stat-content-modern">
                        <div className="stat-number-modern">{allQuizzes.length}</div>
                        <div className="stat-label-modern">Total Quizzes</div>
                    </div>
                    <div className="stat-decoration"></div>
                </div>
                <div className="stat-card-modern stat-completed">
                    <div className="stat-icon-modern">✅</div>
                    <div className="stat-content-modern">
                        <div className="stat-number-modern">{completedCount}</div>
                        <div className="stat-label-modern">Completed</div>
                    </div>
                    <div className="stat-decoration"></div>
                </div>
                <div className="stat-card-modern stat-pending">
                    <div className="stat-icon-modern">⏳</div>
                    <div className="stat-content-modern">
                        <div className="stat-number-modern">{pendingCount}</div>
                        <div className="stat-label-modern">Pending</div>
                    </div>
                    <div className="stat-decoration"></div>
                </div>
                <div className="stat-card-modern stat-average">
                    <div className="stat-icon-modern">🎯</div>
                    <div className="stat-content-modern">
                        <div className="stat-number-modern">{averageScore}%</div>
                        <div className="stat-label-modern">Average Score</div>
                    </div>
                    <div className="stat-decoration"></div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="filter-section">
                <div className="filter-buttons-modern">
                    <button 
                        className={`filter-btn-modern ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <span className="filter-icon">📋</span>
                        <span className="filter-text">All</span>
                        <span className="filter-count">{allQuizzes.length}</span>
                    </button>
                    <button 
                        className={`filter-btn-modern ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        <span className="filter-icon">✅</span>
                        <span className="filter-text">Completed</span>
                        <span className="filter-count">{completedCount}</span>
                    </button>
                    <button 
                        className={`filter-btn-modern ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        <span className="filter-icon">⏳</span>
                        <span className="filter-text">Pending</span>
                        <span className="filter-count">{pendingCount}</span>
                    </button>
                </div>
            </div>

            {/* Quiz Results List */}
            <div className="results-grid-modern">{filteredQuizzes.length === 0 ? (
                    <div className="no-results-modern">
                        <div className="no-results-icon">📭</div>
                        <h3>No Quizzes Found</h3>
                        <p>
                            {filter === 'completed' ? 'You haven\'t completed any quizzes yet.' :
                             filter === 'pending' ? 'All quizzes have been completed!' :
                             'No quizzes available at the moment.'}
                        </p>
                        {filter !== 'all' && (
                            <button 
                                className="btn-reset-filter"
                                onClick={() => setFilter('all')}
                            >
                                Show All Quizzes
                            </button>
                        )}
                    </div>
                ) : (
                    filteredQuizzes.map(quiz => {
                        const attempt = getQuizAttempt(quiz.id);
                        const isCompleted = !!attempt;

                        return (
                            <div key={quiz.id} className={`result-card-modern ${!isCompleted ? 'card-pending' : 'card-completed'}`}>
                                <div className="card-header-modern">
                                    <div className="card-title-section">
                                        <h3 className="card-title-modern">{quiz.title}</h3>
                                        <span className={`difficulty-badge-modern difficulty-${quiz.difficulty.toLowerCase()}`}>
                                            {quiz.difficulty}
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="card-description-modern">{quiz.description}</p>

                                <div className="card-stats-modern">
                                    {isCompleted ? (
                                        <>
                                            <div className="score-display-modern">
                                                <div className="score-circle-modern">
                                                    <svg className="score-ring" viewBox="0 0 120 120">
                                                        <circle className="score-ring-bg" cx="60" cy="60" r="52" />
                                                        <circle 
                                                            className="score-ring-fill" 
                                                            cx="60" 
                                                            cy="60" 
                                                            r="52"
                                                            style={{
                                                                strokeDasharray: `${(attempt.score / 100) * 326.73} 326.73`
                                                            }}
                                                        />
                                                    </svg>
                                                    <div className="score-content-modern">
                                                        <div className="score-value-modern">{attempt.score}%</div>
                                                        <div className="score-label-modern">Score</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="attempt-info-modern">
                                                <div className="info-row-modern">
                                                    <span className="info-icon-modern">✓</span>
                                                    <span className="info-label-modern">Correct:</span>
                                                    <span className="info-value-modern">{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                                                </div>
                                                <div className="info-row-modern">
                                                    <span className="info-icon-modern">⭐</span>
                                                    <span className="info-label-modern">Points:</span>
                                                    <span className="info-value-modern">{attempt.earnedPoints} pts</span>
                                                </div>
                                                <div className="info-row-modern">
                                                    <span className="info-icon-modern">📅</span>
                                                    <span className="info-label-modern">Date:</span>
                                                    <span className="info-value-modern">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="not-started-modern">
                                            <div className="empty-state-icon">⏳</div>
                                            <div className="empty-state-text">
                                                <h4>Not Started Yet</h4>
                                                <p>Begin this quiz to see your results</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions-modern">
                                    {isCompleted ? (
                                        <button 
                                            className="btn-action-modern btn-view"
                                            onClick={() => toggleQuizDetails(quiz.id, attempt.id)}
                                        >
                                            <span className="btn-icon">{expandedQuizId === quiz.id ? '▲' : '▼'}</span>
                                            <span>{expandedQuizId === quiz.id ? 'Hide Questions' : 'Show Questions'}</span>
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn-action-modern btn-start"
                                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                                        >
                                            <span className="btn-icon">🚀</span>
                                            <span>Start Quiz</span>
                                        </button>
                                    )}
                                </div>

                                {/* Questions Review Section */}
                                {isCompleted && expandedQuizId === quiz.id && quizDetails[quiz.id] && (
                                    <div className="questions-review-section">
                                        <h3 className="questions-title">📝 Questions Review</h3>
                                        <div className="questions-list">
                                            {quizDetails[quiz.id].attempt.userAnswers && quizDetails[quiz.id].attempt.userAnswers.map((userAnswer, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`question-card-simple ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}
                                                >
                                                    <div className="question-header-simple">
                                                        <span className="question-num">Q{index + 1}</span>
                                                        <span className={`question-badge ${userAnswer.isCorrect ? 'badge-correct' : 'badge-incorrect'}`}>
                                                            {userAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                        </span>
                                                    </div>
                                                    <p className="question-text-simple">{userAnswer.questionText}</p>
                                                    
                                                    <div className="answers-container">
                                                        <div className="answer-item">
                                                            <strong className="answer-label-simple">Your Answer:</strong>
                                                            <div className={`answer-box ${userAnswer.isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                                                                {userAnswer.selectedOptionText}
                                                            </div>
                                                        </div>
                                                        
                                                        {!userAnswer.isCorrect && (
                                                            <div className="answer-item">
                                                                <strong className="answer-label-simple correct-label">Correct Answer:</strong>
                                                                <div className="answer-box correct-answer">
                                                                    {userAnswer.correctOptionText}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="points-earned">Points: {userAnswer.pointsEarned}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MyResults;
