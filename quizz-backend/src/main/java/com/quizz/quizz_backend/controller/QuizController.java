package com.quizz.quizz_backend.controller;

import com.quizz.quizz_backend.dto.CreateQuizRequest;
import com.quizz.quizz_backend.dto.QuizDTO;
import com.quizz.quizz_backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> createQuiz(@RequestBody CreateQuizRequest request, Authentication authentication) {
        System.out.println("📥 Create quiz request received from: " + authentication.getName());
        QuizDTO quiz = quizService.createQuiz(request, authentication.getName());
        return ResponseEntity.ok(quiz);
    }

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllQuizzes(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        System.out.println("📋 Get all quizzes request from: " + username);
        List<QuizDTO> quizzes = quizService.getAllQuizzes(username);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/my-quizzes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuizDTO>> getMyQuizzes(Authentication authentication) {
        System.out.println("📋 Get my quizzes for: " + authentication.getName());
        List<QuizDTO> quizzes = quizService.getQuizzesByUser(authentication.getName());
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long id) {
        System.out.println("📖 Get quiz by ID: " + id);
        QuizDTO quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(quiz);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long id, @RequestBody CreateQuizRequest request, Authentication authentication) {
        System.out.println("✏️ Update quiz request for ID: " + id + " from: " + authentication.getName());
        QuizDTO quiz = quizService.updateQuiz(id, request, authentication.getName());
        return ResponseEntity.ok(quiz);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long id) {
        System.out.println("🗑️ Delete quiz request for ID: " + id);
        quizService.deleteQuiz(id);
        return ResponseEntity.ok("Quiz deleted successfully");
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> toggleQuizStatus(@PathVariable Long id) {
        System.out.println("🔄 Toggle quiz status for ID: " + id);
        QuizDTO quiz = quizService.toggleQuizStatus(id);
        return ResponseEntity.ok(quiz);
    }
}