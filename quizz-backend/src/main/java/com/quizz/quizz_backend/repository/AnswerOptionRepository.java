package com.quizz.quizz_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quizz.quizz_backend.model.AnswerOption;

@Repository
public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
    List<AnswerOption> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
    void deleteByQuestionId(Long questionId);
}