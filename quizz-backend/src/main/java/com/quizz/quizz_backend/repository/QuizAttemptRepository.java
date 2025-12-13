package com.quizz.quizz_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.quizz.quizz_backend.model.QuizAttempt;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
    List<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);
    
    // For statistics
    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.quiz JOIN FETCH qa.user ORDER BY qa.completedAt DESC")
    List<QuizAttempt> findTop10ByOrderByCompletedAtDesc();
    
    @Query("SELECT COUNT(DISTINCT qa.user.id) FROM QuizAttempt qa WHERE qa.completedAt >= :date")
    Long countDistinctUsersByCompletedAtAfter(@Param("date") LocalDateTime date);
}
