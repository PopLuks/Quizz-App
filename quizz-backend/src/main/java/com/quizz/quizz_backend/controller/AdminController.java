package com.quizz.quizz_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizz.quizz_backend.dto.QuizAttemptDTO;
import com.quizz.quizz_backend.model.Role;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.UserRepository;
import com.quizz.quizz_backend.service.QuizAttemptService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private QuizAttemptService quizAttemptService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        System.out.println("📋 Admin: Getting all users");
        List<User> users = userRepository.findAll();
        System.out.println("✅ Found " + users.size() + " users");
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        System.out.println("🔄 Admin: Toggling status for user ID: " + id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        System.out.println("Current status: " + user.isEnabled());
        
        // Toggle status
        user.setEnabled(!user.isEnabled());
        
        System.out.println("New status: " + user.isEnabled());
        
        // Salvează în baza de date
        User updatedUser = userRepository.save(user);
        
        System.out.println("✅ User " + updatedUser.getUsername() + " status updated to: " + updatedUser.isEnabled());
        
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        System.out.println("🗑️ Admin: Deleting user ID: " + id);
        
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        System.out.println("✅ User deleted successfully");
        
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        System.out.println("✏️ Admin: Updating user ID: " + id);
        System.out.println("Updates: " + updates);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // Update username if provided
        if (updates.containsKey("username") && updates.get("username") != null) {
            user.setUsername(updates.get("username"));
        }
        
        // Update email if provided
        if (updates.containsKey("email") && updates.get("email") != null) {
            user.setEmail(updates.get("email"));
        }
        
        // Update role if provided
        if (updates.containsKey("role") && updates.get("role") != null) {
            try {
                Role role = Role.valueOf(updates.get("role"));
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        // Update password if provided (and not empty)
        if (updates.containsKey("password") && updates.get("password") != null && !updates.get("password").trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updates.get("password")));
        }
        
        User updatedUser = userRepository.save(user);
        System.out.println("✅ User updated successfully: " + updatedUser.getUsername());
        
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/users/{userId}/attempts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getUserAttempts(@PathVariable Long userId) {
        System.out.println("📊 Admin: Getting attempts for user ID: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        List<QuizAttemptDTO> attempts = quizAttemptService.getUserAttempts(user.getUsername());
        System.out.println("✅ Found " + attempts.size() + " attempts for user: " + user.getUsername());
        
        return ResponseEntity.ok(attempts);
    }
}