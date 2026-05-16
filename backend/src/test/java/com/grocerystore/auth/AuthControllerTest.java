package com.grocerystore.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({com.grocerystore.config.SecurityConfig.class, JwtAuthFilter.class, JwtService.class,
         com.grocerystore.common.GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean AuthService authService;
    @MockBean OverrideTokenService overrideTokenService;

    private static final UUID STORE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        when(authService.login(any(), any(), any()))
                .thenReturn(new AuthService.LoginResult("access-token", "refresh-token",
                        UserRole.OWNER, STORE_ID));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("1234", UserRole.OWNER, STORE_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.role").value("OWNER"))
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        when(authService.login(any(), any(), any()))
                .thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("9999", UserRole.OWNER, STORE_ID))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Mã PIN không đúng"));
    }

    @Test
    @WithMockUser
    void overrideToken_validPin_returns200WithToken() throws Exception {
        UUID token = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(60);
        when(overrideTokenService.issueToken(any(), any()))
                .thenReturn(new OverrideTokenService.IssuedToken(token, expiresAt));

        mockMvc.perform(post("/api/v1/auth/override-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new OverrideTokenRequest("1234", STORE_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(token.toString()));
    }

    @Test
    @WithMockUser
    void overrideToken_wrongPin_returns401() throws Exception {
        when(overrideTokenService.issueToken(any(), any()))
                .thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/v1/auth/override-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new OverrideTokenRequest("9999", STORE_ID))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Mã PIN không đúng"));
    }
}
