package com.quizz.quizz_backend.controller;

import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

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
}