package com.quizz.quizz_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quizz.quizz_backend.model.Quiz;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedBy(Long userId);
    List<Quiz> findByIsActive(Boolean isActive);
    List<Quiz> findByCategory(String category);
}