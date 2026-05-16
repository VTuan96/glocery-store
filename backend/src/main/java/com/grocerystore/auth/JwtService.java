package com.grocerystore.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret:dev-secret-key-change-in-production-min-32-chars}")
    private String secret;

    private SecretKey signingKey;

    @PostConstruct
    void init() {
        if (secret.length() < 32) {
            log.error("⚠️ JWT secret is shorter than 32 characters — insecure in production!");
        }
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, UserRole role, UUID storeId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role.name())
                .claim("storeId", storeId.toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + Duration.ofHours(8).toMillis()))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + Duration.ofDays(30).toMillis()))
                .signWith(signingKey)
                .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
