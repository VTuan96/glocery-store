package com.grocerystore.auth;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final UUID userId = UUID.randomUUID();
    private final UUID storeId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "test-secret-key-min-32-chars-long!!");
        jwtService.init();
    }

    @Test
    void accessToken_containsRoleAndStoreIdClaims() {
        String token = jwtService.generateAccessToken(userId, UserRole.OWNER, storeId);
        Claims claims = jwtService.validateToken(token);

        assertEquals(userId.toString(), claims.getSubject());
        assertEquals("OWNER", claims.get("role", String.class));
        assertEquals(storeId.toString(), claims.get("storeId", String.class));
    }

    @Test
    void refreshToken_containsOnlySubject() {
        String token = jwtService.generateRefreshToken(userId);
        Claims claims = jwtService.validateToken(token);

        assertEquals(userId.toString(), claims.getSubject());
        assertNull(claims.get("role"));
    }

    @Test
    void validateToken_throwsOnTamperedToken() {
        String token = jwtService.generateAccessToken(userId, UserRole.STAFF, storeId);
        assertThrows(Exception.class, () -> jwtService.validateToken(token + "tampered"));
    }
}
