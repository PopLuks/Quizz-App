package com.quizz.quizz_backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        System.out.println("=== JwtAuthenticationFilter START ===");
        System.out.println("Request URI: " + request.getRequestURI());
        
        try {
            String jwt = getJwtFromRequest(request);
            
            System.out.println("JWT Token extracted: " + (jwt != null ? "YES (length: " + jwt.length() + ")" : "NO"));

            if (StringUtils.hasText(jwt)) {
                System.out.println("Validating token...");
                boolean isValid = jwtTokenProvider.validateToken(jwt);
                System.out.println("Token valid: " + isValid);
                
                if (isValid) {
                    String username = jwtTokenProvider.getUsernameFromToken(jwt);
                    System.out.println("Username from token: " + username);

                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                    System.out.println("User loaded: " + userDetails.getUsername());
                    System.out.println("Authorities: " + userDetails.getAuthorities());

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    System.out.println("✅ Authentication set successfully!");
                    System.out.println("SecurityContext Authentication: " + SecurityContextHolder.getContext().getAuthentication());
                } else {
                    System.out.println("❌ Token validation failed");
                }
            } else {
                System.out.println("❌ No JWT token found in request");
            }
        } catch (Exception ex) {
            System.err.println("❌ Error in JWT filter: " + ex.getMessage());
            ex.printStackTrace();
        }
        
        System.out.println("=== JwtAuthenticationFilter END ===");
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        System.out.println("Authorization header: " + (bearerToken != null ? bearerToken.substring(0, Math.min(30, bearerToken.length())) + "..." : "NULL"));
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}