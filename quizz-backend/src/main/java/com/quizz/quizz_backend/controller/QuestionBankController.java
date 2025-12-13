package com.quizz.quizz_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.quizz.quizz_backend.dto.QuestionBankDTO;
import com.quizz.quizz_backend.service.QuestionBankService;

@RestController
@RequestMapping("/api/question-bank")
@CrossOrigin(origins = "*", maxAge = 3600)
public class QuestionBankController {

    @Autowired
    private QuestionBankService questionBankService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionBankDTO> createQuestion(
            @RequestBody QuestionBankDTO dto,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            QuestionBankDTO created = questionBankService.createQuestion(dto, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuestionBankDTO>> getMyQuestions(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<QuestionBankDTO> questions = questionBankService.getMyQuestions(username);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionBankDTO> getQuestionById(@PathVariable Long id) {
        try {
            QuestionBankDTO question = questionBankService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionBankDTO> updateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionBankDTO dto,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            QuestionBankDTO updated = questionBankService.updateQuestion(id, dto, username);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            questionBankService.deleteQuestion(id, username);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
