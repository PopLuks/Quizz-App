package com.quizz.quizz_backend.dto;

import java.util.ArrayList;
import java.util.List;

import com.quizz.quizz_backend.model.Difficulty;
import com.quizz.quizz_backend.model.QuestionType;

public class QuestionBankDTO {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private Difficulty difficulty;
    private String category;
    private Integer points;
    private List<QuestionBankOptionDTO> answerOptions = new ArrayList<>();

    // Constructors
    public QuestionBankDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public List<QuestionBankOptionDTO> getAnswerOptions() {
        return answerOptions;
    }

    public void setAnswerOptions(List<QuestionBankOptionDTO> answerOptions) {
        this.answerOptions = answerOptions;
    }

    public static class QuestionBankOptionDTO {
        private Long id;
        private String optionText;
        private Boolean isCorrect;

        public QuestionBankOptionDTO() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getOptionText() {
            return optionText;
        }

        public void setOptionText(String optionText) {
            this.optionText = optionText;
        }

        public Boolean getIsCorrect() {
            return isCorrect;
        }

        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
    }
}
