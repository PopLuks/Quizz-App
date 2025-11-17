package com.quizz.quizz_backend.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        String username = userDetails.getUsername();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_USER");

        System.out.println("🔑 Generating token for user: '" + username + "' with role: " + role);

        String token = Jwts.builder()
                .setSubject(username)  // CRUCIAL: Username-ul trebuie să fie exact
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
        
        System.out.println("✅ Token generated successfully for: " + username);
        
        return token;
    }

    public String getUsernameFromToken(String token) {
        try {
            String username = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            
            System.out.println("📖 Extracted username from token: '" + username + "'");
            
            return username;
        } catch (Exception e) {
            System.err.println("❌ Error extracting username from token: " + e.getMessage());
            throw e;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            
            System.out.println("✅ Token is valid");
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("❌ Token expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("❌ Token unsupported: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("❌ Token malformed: " + e.getMessage());
        } catch (SignatureException e) {
            System.err.println("❌ Invalid signature: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Token claims empty: " + e.getMessage());
        }
        return false;
    }
}
