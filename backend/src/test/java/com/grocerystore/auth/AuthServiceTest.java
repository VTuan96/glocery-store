package com.grocerystore.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock StoreUserRepository userRepository;
    @Mock JwtService jwtService;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @InjectMocks AuthService authService;

    private final UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private StoreUser activeOwner() {
        StoreUser u = new StoreUser();
        u.setStoreId(storeId);
        u.setRole(UserRole.OWNER);
        u.setActive(true);
        u.setPinHash("$hashed$");
        return u;
    }

    @Test
    void login_validPin_returnsTokens() {
        StoreUser user = activeOwner();
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("1234", "$hashed$")).thenReturn(true);
        when(jwtService.generateAccessToken(any(), eq(UserRole.OWNER), eq(storeId))).thenReturn("access");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh");

        AuthService.LoginResult result = authService.login("1234", UserRole.OWNER, storeId);

        assertEquals("access", result.accessToken());
        assertEquals("refresh", result.refreshToken());
        assertEquals(UserRole.OWNER, result.role());
    }

    @Test
    void login_wrongPin_throwsInvalidCredentials() {
        StoreUser user = activeOwner();
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("9999", "$hashed$")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login("9999", UserRole.OWNER, storeId));
    }

    @Test
    void login_userNotFound_throwsInvalidCredentials() {
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> authService.login("1234", UserRole.OWNER, storeId));
    }
}
