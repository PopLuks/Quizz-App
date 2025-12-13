package com.quizz.quizz_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizz.quizz_backend.dto.AnswerOptionDTO;
import com.quizz.quizz_backend.dto.CreateQuizRequest;
import com.quizz.quizz_backend.dto.QuestionDTO;
import com.quizz.quizz_backend.dto.QuizDTO;
import com.quizz.quizz_backend.model.AnswerOption;
import com.quizz.quizz_backend.model.Question;
import com.quizz.quizz_backend.model.Quiz;
import com.quizz.quizz_backend.model.QuizAttempt;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.AnswerOptionRepository;
import com.quizz.quizz_backend.repository.QuestionRepository;
import com.quizz.quizz_backend.repository.QuizAttemptRepository;
import com.quizz.quizz_backend.repository.QuizRepository;
import com.quizz.quizz_backend.repository.UserRepository;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerOptionRepository answerOptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private WebSocketNotificationService notificationService;

    @Transactional
    public QuizDTO createQuiz(CreateQuizRequest request, String username) {
        System.out.println("Creating quiz: " + request.getTitle());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setCreatedBy(user.getId());
        quiz.setIsActive(true);

        Quiz savedQuiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                QuestionDTO qDto = request.getQuestions().get(i);
                
                Question question = new Question();
                question.setQuiz(savedQuiz);
                question.setQuestionText(qDto.getQuestionText());
                question.setQuestionType(qDto.getQuestionType());
                question.setPoints(qDto.getPoints() != null ? qDto.getPoints() : 1);
                question.setOrderIndex(i);

                Question savedQuestion = questionRepository.save(question);

                if (qDto.getAnswerOptions() != null) {
                    for (int j = 0; j < qDto.getAnswerOptions().size(); j++) {
                        AnswerOptionDTO aDto = qDto.getAnswerOptions().get(j);
                        
                        AnswerOption option = new AnswerOption();
                        option.setQuestion(savedQuestion);
                        option.setOptionText(aDto.getOptionText());
                        option.setIsCorrect(aDto.getIsCorrect());
                        option.setOrderIndex(j);

                        answerOptionRepository.save(option);
                    }
                }
            }
        }

        QuizDTO result = convertToDTO(quizRepository.findById(savedQuiz.getId()).get());
        
        // Notify via WebSocket
        notificationService.notifyQuizUpdate("created", savedQuiz.getId());
        
        return result;
    }

    public List<QuizDTO> getAllQuizzes(String username) {
        Long userId = null;
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            userId = user != null ? user.getId() : null;
        }
        
        final Long finalUserId = userId;
        return quizRepository.findAll().stream()
                .map(quiz -> convertToDTO(quiz, finalUserId))
                .collect(Collectors.toList());
    }

    public List<QuizDTO> getQuizzesByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return quizRepository.findByCreatedBy(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuizDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return convertToDTO(quiz);
    }

    @Transactional
    public QuizDTO updateQuiz(Long id, CreateQuizRequest request, String username) {
        System.out.println("Updating quiz: " + id);

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is the creator
        if (!quiz.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this quiz");
        }

        // Update quiz details
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(request.getCategory());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setTimeLimit(request.getTimeLimit());
        quiz.setPassingScore(request.getPassingScore());

        Quiz savedQuiz = quizRepository.save(quiz);

        // Delete existing questions and options
        List<Question> existingQuestions = questionRepository.findByQuizIdOrderByOrderIndexAsc(id);
        for (Question q : existingQuestions) {
            answerOptionRepository.deleteByQuestionId(q.getId());
        }
        questionRepository.deleteByQuizId(id);

        // Add new questions
        if (request.getQuestions() != null) {
            for (int i = 0; i < request.getQuestions().size(); i++) {
                QuestionDTO qDto = request.getQuestions().get(i);
                
                Question question = new Question();
                question.setQuiz(savedQuiz);
                question.setQuestionText(qDto.getQuestionText());
                question.setQuestionType(qDto.getQuestionType());
                question.setPoints(qDto.getPoints() != null ? qDto.getPoints() : 1);
                question.setOrderIndex(i);

                Question savedQuestion = questionRepository.save(question);

                if (qDto.getAnswerOptions() != null) {
                    for (int j = 0; j < qDto.getAnswerOptions().size(); j++) {
                        AnswerOptionDTO aDto = qDto.getAnswerOptions().get(j);
                        
                        AnswerOption option = new AnswerOption();
                        option.setQuestion(savedQuestion);
                        option.setOptionText(aDto.getOptionText());
                        option.setIsCorrect(aDto.getIsCorrect());
                        option.setOrderIndex(j);

                        answerOptionRepository.save(option);
                    }
                }
            }
        }

        QuizDTO result = convertToDTO(quizRepository.findById(savedQuiz.getId()).get());
        
        // Notify via WebSocket
        notificationService.notifyQuizUpdate("updated", savedQuiz.getId());
        
        return result;
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
        
        // Notify via WebSocket
        notificationService.notifyQuizUpdate("deleted", id);
    }

    @Transactional
    public QuizDTO toggleQuizStatus(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        quiz.setIsActive(!quiz.getIsActive());
        Quiz updated = quizRepository.save(quiz);
        
        // Notify via WebSocket
        notificationService.notifyQuizUpdate("updated", id);
        
        return convertToDTO(updated);
    }

    private QuizDTO convertToDTO(Quiz quiz) {
        return convertToDTO(quiz, null);
    }

    private QuizDTO convertToDTO(Quiz quiz, Long userId) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setCategory(quiz.getCategory());
        dto.setDifficulty(quiz.getDifficulty());
        dto.setTimeLimit(quiz.getTimeLimit());
        dto.setPassingScore(quiz.getPassingScore());
        dto.setIsActive(quiz.getIsActive());
        dto.setCreatedBy(quiz.getCreatedBy());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setUpdatedAt(quiz.getUpdatedAt());

        // Check if user has attempted this quiz
        if (userId != null) {
            List<QuizAttempt> attempts = attemptRepository.findByUserIdAndQuizId(userId, quiz.getId());
            if (!attempts.isEmpty()) {
                dto.setHasAttempted(true);
                dto.setAttemptId(attempts.get(0).getId());
            } else {
                dto.setHasAttempted(false);
            }
        } else {
            dto.setHasAttempted(false);
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(quiz.getId());
        dto.setQuestions(questions.stream().map(this::convertQuestionToDTO).collect(Collectors.toList()));

        return dto;
    }

    private QuestionDTO convertQuestionToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setPoints(question.getPoints());
        dto.setOrderIndex(question.getOrderIndex());

        List<AnswerOption> options = answerOptionRepository.findByQuestionIdOrderByOrderIndexAsc(question.getId());
        dto.setAnswerOptions(options.stream().map(this::convertAnswerToDTO).collect(Collectors.toList()));

        return dto;
    }

    private AnswerOptionDTO convertAnswerToDTO(AnswerOption answer) {
        AnswerOptionDTO dto = new AnswerOptionDTO();
        dto.setId(answer.getId());
        dto.setOptionText(answer.getOptionText());
        dto.setIsCorrect(answer.getIsCorrect());
        dto.setOrderIndex(answer.getOrderIndex());
        return dto;
    }
}