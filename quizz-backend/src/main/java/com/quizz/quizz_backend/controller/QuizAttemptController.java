package com.quizz.quizz_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizz.quizz_backend.dto.QuizAttemptDTO;
import com.quizz.quizz_backend.dto.SubmitQuizRequest;
import com.quizz.quizz_backend.service.QuizAttemptService;

@RestController
@RequestMapping("/api/attempts")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService attemptService;

    @PostMapping("/submit")
    public ResponseEntity<QuizAttemptDTO> submitQuiz(@RequestBody SubmitQuizRequest request, Authentication authentication) {
        try {
            System.out.println("📥 Quiz submission received from: " + authentication.getName());
            System.out.println("Request data: quizId=" + request.getQuizId() + ", answers=" + request.getAnswers());
            QuizAttemptDTO attempt = attemptService.submitQuiz(request, authentication.getName());
            System.out.println("✅ Quiz submission successful!");
            return ResponseEntity.ok(attempt);
        } catch (Exception e) {
            System.err.println("❌ Error in submitQuiz: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<List<QuizAttemptDTO>> getMyAttempts(Authentication authentication) {
        System.out.println("📋 Get attempts for: " + authentication.getName());
        List<QuizAttemptDTO> attempts = attemptService.getUserAttempts(authentication.getName());
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizAttemptDTO> getAttemptById(@PathVariable Long id) {
        System.out.println("📖 Get attempt by ID: " + id);
        QuizAttemptDTO attempt = attemptService.getAttemptById(id);
        return ResponseEntity.ok(attempt);
    }
}
