import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './User.css';

const QuizResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { quiz, answers, correctAnswers, totalQuestions, scorePercentage, earnedPoints, totalPoints, passed } = location.state || {};

    if (!quiz) {
        return (
            <div className="user-page">
                <div className="error">No quiz data found</div>
                <button onClick={() => navigate('/quizzes')} className="btn-primary">
                    Back to Quizzes
                </button>
            </div>
        );
    }

    return (
        <div className="user-page">
            <div className="result-container">
                <div className={`result-header ${passed ? 'passed' : 'failed'}`}>
                    <div className="result-icon">
                        {passed ? '🎉' : '📚'}
                    </div>
                    <h1>{passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
                    <p className="result-message">
                        {passed 
                            ? 'You passed the quiz!' 
                            : 'You need more practice to pass this quiz.'}
                    </p>
                </div>

                <div className="result-stats">
                    <div className="stat-card">
                        <div className="stat-value">{scorePercentage}%</div>
                        <div className="stat-label">Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{correctAnswers}/{totalQuestions}</div>
                        <div className="stat-label">Correct Answers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{earnedPoints}/{totalPoints}</div>
                        <div className="stat-label">Points Earned</div>
                    </div>
                </div>

                <div className="result-details">
                    <h2>Quiz Review</h2>
                    <div className="questions-review">
                        {quiz.questions.map((question, index) => {
                            const selectedAnswerData = answers[question.id];
                            
                            // Handle both single answer (number) and multiple answers (array)
                            const selectedAnswerIds = Array.isArray(selectedAnswerData) 
                                ? selectedAnswerData 
                                : (selectedAnswerData ? [selectedAnswerData] : []);
                            
                            // Get all correct answer IDs
                            const correctAnswerIds = question.answerOptions
                                .filter(opt => opt.isCorrect)
                                .map(opt => opt.id);
                            
                            // Check if answer is correct
                            const isCorrect = selectedAnswerIds.length === correctAnswerIds.length &&
                                            selectedAnswerIds.every(id => correctAnswerIds.includes(id)) &&
                                            correctAnswerIds.every(id => selectedAnswerIds.includes(id));

                            return (
                                <div key={question.id} className="review-item">
                                    <div className="review-header">
                                        <span className="review-number">Question {index + 1}</span>
                                        <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                        </span>
                                    </div>
                                    
                                    <p className="review-question">{question.questionText}</p>
                                    
                                    <div className="review-answers">
                                        {question.answerOptions.map(option => {
                                            const wasSelected = selectedAnswerIds.includes(option.id);
                                            const shouldBeSelected = option.isCorrect;
                                            
                                            return (
                                                <div 
                                                    key={option.id} 
                                                    className={`review-answer 
                                                        ${shouldBeSelected ? 'correct-answer' : ''} 
                                                        ${wasSelected && !shouldBeSelected ? 'wrong-answer' : ''}
                                                        ${wasSelected ? 'selected' : ''}`}
                                                >
                                                    {shouldBeSelected && <span className="icon">✓</span>}
                                                    {wasSelected && !shouldBeSelected && <span className="icon">✗</span>}
                                                    {option.optionText}
                                                    {wasSelected && <span style={{marginLeft: '10px', fontWeight: 'bold'}}>← Your answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {!isCorrect && (
                                        <div className="correct-answer-info">
                                            <strong>Correct Answer{correctAnswerIds.length > 1 ? 's' : ''}:</strong>{' '}
                                            {question.answerOptions
                                                .filter(opt => opt.isCorrect)
                                                .map(opt => opt.optionText)
                                                .join(', ')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

export default QuizResult;
