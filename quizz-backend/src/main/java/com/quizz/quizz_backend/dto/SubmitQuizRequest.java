package com.quizz.quizz_backend.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SubmitQuizRequest {
    private Long quizId;
    
    @JsonProperty("answers")
    private Map<String, Object> answers; // questionId as String -> selectedOptionId (Number) or List<Number> for multiple choice
    private Integer timeTakenSeconds;

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Map<String, Object> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Object> answers) {
        this.answers = answers;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
}
