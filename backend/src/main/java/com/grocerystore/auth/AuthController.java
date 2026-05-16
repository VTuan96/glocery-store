package com.grocerystore.auth;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final OverrideTokenService overrideTokenService;

    public AuthController(AuthService authService, OverrideTokenService overrideTokenService) {
        this.authService = authService;
        this.overrideTokenService = overrideTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request.pin(), request.role(), request.storeId());
        addRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(new LoginResponse(result.accessToken(), result.role(), result.storeId()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null) {
            throw new InvalidCredentialsException();
        }
        AuthService.LoginResult result = authService.refresh(refreshToken);
        addRefreshCookie(response, result.refreshToken());
        return ResponseEntity.ok(new LoginResponse(result.accessToken(), result.role(), result.storeId()));
    }

    private void addRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .sameSite("Strict")
                .maxAge(Duration.ofDays(30))
                .path("/api/v1/auth/refresh")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @PostMapping("/override-token")
    public ResponseEntity<OverrideTokenResponse> issueOverrideToken(
            @Valid @RequestBody OverrideTokenRequest request) {
        OverrideTokenService.IssuedToken issued = overrideTokenService.issueToken(
                request.ownerPin(), request.storeId());
        return ResponseEntity.ok(new OverrideTokenResponse(issued.token(), issued.expiresAt()));
    }
}
