package com.quizz.quizz_backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizz.quizz_backend.dto.JwtResponse;
import com.quizz.quizz_backend.dto.LoginRequest;
import com.quizz.quizz_backend.dto.SignupRequest;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.UserRepository;
import com.quizz.quizz_backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest) {
        String message = authService.signup(signupRequest);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyAccount() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            System.out.println("🔍 Verifying account for: " + username);
            
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("enabled", user.isEnabled());
            
            System.out.println("✅ Account verified - Enabled: " + user.isEnabled());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Verification failed: " + e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }
}
