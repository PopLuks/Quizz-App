package com.quizz.quizz_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quizz.quizz_backend.dto.JwtResponse;
import com.quizz.quizz_backend.dto.LoginRequest;
import com.quizz.quizz_backend.dto.SignupRequest;
import com.quizz.quizz_backend.model.Role;
import com.quizz.quizz_backend.model.User;
import com.quizz.quizz_backend.repository.UserRepository;
import com.quizz.quizz_backend.security.JwtTokenProvider;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public JwtResponse login(LoginRequest loginRequest) {
        try {
            // Verifică dacă userul există și este enabled
            User user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));
            
            if (!user.isEnabled()) {
                System.out.println("❌ Login attempt for disabled user: " + user.getUsername());
                throw new DisabledException("Account is disabled. Please contact administrator.");
            }

            System.out.println("🔐 Login attempt for user: " + loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            String jwt = jwtTokenProvider.generateToken(authentication);

            System.out.println("✅ Login successful for user: " + user.getUsername() + " | Role: " + user.getRole());

            return new JwtResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
            
        } catch (DisabledException e) {
            System.out.println("❌ Disabled account login attempt");
            throw new RuntimeException("Your account has been disabled. Please contact support.");
        } catch (AuthenticationException e) {
            System.out.println("❌ Invalid credentials");
            throw new RuntimeException("Invalid username or password");
        }
    }

    public String signup(SignupRequest signupRequest) {
        if (userRepository.findByUsername(signupRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(Role.USER);
        user.setEnabled(true);

        userRepository.save(user);

        System.out.println("✅ New user registered: " + user.getUsername());

        return "User registered successfully!";
    }
}
