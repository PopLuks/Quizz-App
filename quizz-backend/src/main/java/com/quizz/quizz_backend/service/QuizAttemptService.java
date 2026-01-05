package com.quizz.quizz_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizz.quizz_backend.dto.QuizAttemptDTO;
import com.quizz.quizz_backend.dto.SubmitQuizRequest;
import com.quizz.quizz_backend.dto.UserAnswerDTO;
import com.quizz.quizz_backend.model.AnswerOption;
import com.quizz.quizz_backend.model.Question;
import com.quizz.quizz_backend.model.QuestionType;
import com.quizz.quizz_backend.model.Quiz;
import com.quizz.quizz_backend.model.QuizAttempt;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.model.UserAnswer;
import com.quizz.quizz_backend.repository.AnswerOptionRepository;
import com.quizz.quizz_backend.repository.QuestionRepository;
import com.quizz.quizz_backend.repository.QuizAttemptRepository;
import com.quizz.quizz_backend.repository.QuizRepository;
import com.quizz.quizz_backend.repository.UserAnswerRepository;
import com.quizz.quizz_backend.repository.UserRepository;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private UserAnswerRepository userAnswerRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public QuizAttemptDTO submitQuiz(SubmitQuizRequest request, String username) {
        System.out.println("📝 Processing quiz submission for user: " + username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check if user has already completed this quiz
        List<QuizAttempt> existingAttempts = attemptRepository.findByUserIdAndQuizId(user.getId(), quiz.getId());
        if (!existingAttempts.isEmpty()) {
            throw new RuntimeException("You have already completed this quiz. Each quiz can only be taken once.");
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quiz.getId());

        // Create quiz attempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(LocalDateTime.now().minusSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0));
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setTimeTakenSeconds(request.getTimeTakenSeconds());
        attempt.setTotalQuestions(questions.size());

        int correctAnswers = 0;
        int earnedPoints = 0;
        int totalPoints = 0;

        // Process each answer
        Map<String, Object> answers = request.getAnswers();
        
        System.out.println("📊 Processing " + questions.size() + " questions");
        System.out.println("📝 Received answers map: " + answers);
        
        for (Question question : questions) {
            totalPoints += question.getPoints();
            
            String questionIdStr = String.valueOf(question.getId());
            Object answerData = answers.get(questionIdStr);
            
            System.out.println("❓ Question " + questionIdStr + " (Type: " + question.getQuestionType() + ")");
            System.out.println("   Answer data: " + answerData + " (Type: " + (answerData != null ? answerData.getClass().getName() : "null") + ")");
            
            if (answerData != null) {
                boolean questionCorrect = false;
                
                try {
                    if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                        // Handle multiple choice questions
                        List<Long> selectedOptionIds;
                        if (answerData instanceof List) {
                            // Convert List of Numbers to List of Longs
                            List<?> rawList = (List<?>) answerData;
                            selectedOptionIds = rawList.stream()
                                    .map(item -> item instanceof Number ? ((Number) item).longValue() : Long.parseLong(item.toString()))
                                    .collect(Collectors.toList());
                        } else {
                        // Convert single value to list for consistency
                        Long singleId = answerData instanceof Number 
                                ? ((Number) answerData).longValue() 
                                : Long.parseLong(answerData.toString());
                        selectedOptionIds = List.of(singleId);
                    }
                    
                    // Get all correct options for this question
                    List<AnswerOption> allOptions = answerOptionRepository.findByQuestionIdOrderByOrderIndexAsc(question.getId());
                    List<Long> correctOptionIds = allOptions.stream()
                            .filter(AnswerOption::getIsCorrect)
                            .map(AnswerOption::getId)
                            .collect(Collectors.toList());
                    
                    // Check if selected answers match exactly with correct answers
                    questionCorrect = selectedOptionIds.size() == correctOptionIds.size() &&
                                     selectedOptionIds.containsAll(correctOptionIds) &&
                                     correctOptionIds.containsAll(selectedOptionIds);
                    
                    // For multiple choice, save only the first selected option as the main answer
                    // This represents the entire question's answer
                    if (!selectedOptionIds.isEmpty()) {
                        AnswerOption firstSelectedOption = answerOptionRepository.findById(selectedOptionIds.get(0)).orElse(null);
                        if (firstSelectedOption != null) {
                            UserAnswer userAnswer = new UserAnswer();
                            userAnswer.setAttempt(attempt);
                            userAnswer.setQuestion(question);
                            userAnswer.setSelectedOption(firstSelectedOption);
                            userAnswer.setIsCorrect(questionCorrect);
                            userAnswer.setPointsEarned(questionCorrect ? question.getPoints() : 0);
                            
                            attempt = attemptRepository.save(attempt);
                            userAnswerRepository.save(userAnswer);
                        }
                    }
                    
                    if (questionCorrect) {
                        correctAnswers++;
                        earnedPoints += question.getPoints();
                    }
                    
                } else {
                    // Handle single choice questions (SINGLE_CHOICE, TRUE_FALSE)
                    Long selectedOptionId = answerData instanceof Number 
                            ? ((Number) answerData).longValue() 
                            : Long.parseLong(answerData.toString());
                    
                    AnswerOption selectedOption = answerOptionRepository.findById(selectedOptionId).orElse(null);
                    
                    if (selectedOption != null) {
                        questionCorrect = selectedOption.getIsCorrect();
                        
                        UserAnswer userAnswer = new UserAnswer();
                        userAnswer.setAttempt(attempt);
                        userAnswer.setQuestion(question);
                        userAnswer.setSelectedOption(selectedOption);
                        userAnswer.setIsCorrect(questionCorrect);
                        userAnswer.setPointsEarned(questionCorrect ? question.getPoints() : 0);
                        
                        attempt = attemptRepository.save(attempt);
                        userAnswerRepository.save(userAnswer);
                        
                        if (questionCorrect) {
                            correctAnswers++;
                            earnedPoints += question.getPoints();
                        }
                    }
                }
                } catch (Exception e) {
                    System.err.println("❌ Error processing answer for question " + questionIdStr + ": " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Error processing answer for question " + questionIdStr + ": " + e.getMessage(), e);
                }
            }
        }

        // Calculate score
        double scorePercentage = totalPoints > 0 ? ((double) earnedPoints / totalPoints) * 100 : 0;
        boolean passed = scorePercentage >= quiz.getPassingScore();

        attempt.setCorrectAnswers(correctAnswers);
        attempt.setEarnedPoints(earnedPoints);
        attempt.setTotalPoints(totalPoints);
        attempt.setScore(scorePercentage);
        attempt.setPassed(passed);

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        System.out.println("✅ Quiz attempt saved with score: " + scorePercentage + "%");

        return convertToDTO(savedAttempt);
    }

    public List<QuizAttemptDTO> getUserAttempts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return attemptRepository.findByUserIdOrderByCompletedAtDesc(user.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuizAttemptDTO getAttemptById(Long id) {
        QuizAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return convertToDTO(attempt);
    }

    private QuizAttemptDTO convertToDTO(QuizAttempt attempt) {
        QuizAttemptDTO dto = new QuizAttemptDTO();
        dto.setId(attempt.getId());
        dto.setUserId(attempt.getUser().getId());
        dto.setUsername(attempt.getUser().getUsername());
        dto.setQuizId(attempt.getQuiz().getId());
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setScore(attempt.getScore());
        dto.setTotalQuestions(attempt.getTotalQuestions());
        dto.setCorrectAnswers(attempt.getCorrectAnswers());
        dto.setEarnedPoints(attempt.getEarnedPoints());
        dto.setTotalPoints(attempt.getTotalPoints());
        dto.setPassed(attempt.getPassed());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        dto.setTimeTakenSeconds(attempt.getTimeTakenSeconds());
        
        // Fetch and convert user answers
        List<UserAnswer> userAnswers = userAnswerRepository.findByAttemptId(attempt.getId());
        List<UserAnswerDTO> userAnswerDTOs = userAnswers.stream()
                .map(this::convertUserAnswerToDTO)
                .collect(Collectors.toList());
        dto.setUserAnswers(userAnswerDTOs);
        
        return dto;
    }
    
    private UserAnswerDTO convertUserAnswerToDTO(UserAnswer userAnswer) {
        UserAnswerDTO dto = new UserAnswerDTO();
        dto.setQuestionId(userAnswer.getQuestion().getId());
        dto.setQuestionText(userAnswer.getQuestion().getQuestionText());
        dto.setSelectedOptionId(userAnswer.getSelectedOption().getId());
        dto.setSelectedOptionText(userAnswer.getSelectedOption().getOptionText());
        
        // Find the correct answer option
        List<AnswerOption> options = answerOptionRepository.findByQuestionIdOrderByOrderIndexAsc(
                userAnswer.getQuestion().getId());
        AnswerOption correctOption = options.stream()
                .filter(AnswerOption::getIsCorrect)
                .findFirst()
                .orElse(null);
        
        if (correctOption != null) {
            dto.setCorrectOptionId(correctOption.getId());
            dto.setCorrectOptionText(correctOption.getOptionText());
        }
        
        dto.setIsCorrect(userAnswer.getIsCorrect());
        dto.setPointsEarned(userAnswer.getPointsEarned());
        
        return dto;
    }
}
