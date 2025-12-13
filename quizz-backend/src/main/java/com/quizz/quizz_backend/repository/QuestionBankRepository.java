package com.quizz.quizz_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quizz.quizz_backend.model.Difficulty;
import com.quizz.quizz_backend.model.QuestionBank;
import com.quizz.quizz_backend.model.User;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    List<QuestionBank> findByCreatedByOrderByCreatedAtDesc(User user);
    List<QuestionBank> findByCategoryOrderByCreatedAtDesc(String category);
    List<QuestionBank> findByDifficultyOrderByCreatedAtDesc(Difficulty difficulty);
    List<QuestionBank> findByCreatedByAndCategoryOrderByCreatedAtDesc(User user, String category);
    List<QuestionBank> findByCreatedByAndDifficultyOrderByCreatedAtDesc(User user, Difficulty difficulty);
}
