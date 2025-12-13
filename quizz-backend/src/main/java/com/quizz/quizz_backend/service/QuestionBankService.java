package com.quizz.quizz_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizz.quizz_backend.dto.QuestionBankDTO;
import com.quizz.quizz_backend.model.QuestionBank;
import com.quizz.quizz_backend.model.QuestionBankOption;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.QuestionBankRepository;
import com.quizz.quizz_backend.repository.UserRepository;

@Service
public class QuestionBankService {

    @Autowired
    private QuestionBankRepository questionBankRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public QuestionBankDTO createQuestion(QuestionBankDTO dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        QuestionBank question = new QuestionBank();
        question.setQuestionText(dto.getQuestionText());
        question.setQuestionType(dto.getQuestionType());
        question.setDifficulty(dto.getDifficulty());
        question.setCategory(dto.getCategory());
        question.setPoints(dto.getPoints());
        question.setCreatedBy(user);
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());

        // Add answer options
        if (dto.getAnswerOptions() != null) {
            for (int i = 0; i < dto.getAnswerOptions().size(); i++) {
                QuestionBankDTO.QuestionBankOptionDTO optionDTO = dto.getAnswerOptions().get(i);
                QuestionBankOption option = new QuestionBankOption();
                option.setOptionText(optionDTO.getOptionText());
                option.setIsCorrect(optionDTO.getIsCorrect());
                option.setOrderIndex(i);
                question.addAnswerOption(option);
            }
        }

        QuestionBank saved = questionBankRepository.save(question);
        return convertToDTO(saved);
    }

    @Transactional
    public QuestionBankDTO updateQuestion(Long id, QuestionBankDTO dto, String username) {
        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is the owner
        if (!question.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to edit this question");
        }

        question.setQuestionText(dto.getQuestionText());
        question.setQuestionType(dto.getQuestionType());
        question.setDifficulty(dto.getDifficulty());
        question.setCategory(dto.getCategory());
        question.setPoints(dto.getPoints());
        question.setUpdatedAt(LocalDateTime.now());

        // Update answer options
        question.getAnswerOptions().clear();
        if (dto.getAnswerOptions() != null) {
            for (int i = 0; i < dto.getAnswerOptions().size(); i++) {
                QuestionBankDTO.QuestionBankOptionDTO optionDTO = dto.getAnswerOptions().get(i);
                QuestionBankOption option = new QuestionBankOption();
                option.setOptionText(optionDTO.getOptionText());
                option.setIsCorrect(optionDTO.getIsCorrect());
                option.setOrderIndex(i);
                question.addAnswerOption(option);
            }
        }

        QuestionBank updated = questionBankRepository.save(question);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteQuestion(Long id, String username) {
        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is the owner
        if (!question.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this question");
        }

        questionBankRepository.delete(question);
    }

    public List<QuestionBankDTO> getMyQuestions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuestionBank> questions = questionBankRepository.findByCreatedByOrderByCreatedAtDesc(user);
        return questions.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public QuestionBankDTO getQuestionById(Long id) {
        QuestionBank question = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return convertToDTO(question);
    }

    private QuestionBankDTO convertToDTO(QuestionBank question) {
        QuestionBankDTO dto = new QuestionBankDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setDifficulty(question.getDifficulty());
        dto.setCategory(question.getCategory());
        dto.setPoints(question.getPoints());

        List<QuestionBankDTO.QuestionBankOptionDTO> optionDTOs = question.getAnswerOptions().stream()
                .map(option -> {
                    QuestionBankDTO.QuestionBankOptionDTO optionDTO = new QuestionBankDTO.QuestionBankOptionDTO();
                    optionDTO.setId(option.getId());
                    optionDTO.setOptionText(option.getOptionText());
                    optionDTO.setIsCorrect(option.getIsCorrect());
                    return optionDTO;
                })
                .collect(Collectors.toList());

        dto.setAnswerOptions(optionDTOs);
        return dto;
    }
}
