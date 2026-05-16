package com.grocerystore.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final StoreUserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(StoreUserRepository userRepository, JwtService jwtService,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginResult(String accessToken, String refreshToken, UserRole role, UUID storeId) {}

    /**
     * Validates PIN for the given role+storeId.
     * Throws InvalidCredentialsException on any mismatch — never reveals whether user exists.
     */
    public LoginResult login(String pin, UserRole role, UUID storeId) {
        StoreUser user = userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, role)
                .orElseGet(() -> {
                    // Check if user exists but is inactive
                    return userRepository.findByStoreIdAndRole(storeId, role)
                            .stream().findFirst()
                            .map(u -> { if (!u.isActive()) throw new DeactivatedAccountException(); return u; })
                            .orElseThrow(InvalidCredentialsException::new);
                });

        if (!passwordEncoder.matches(pin, user.getPinHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole(), storeId);
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        return new LoginResult(accessToken, refreshToken, user.getRole(), storeId);
    }

    /**
     * Issues a new access token from a valid refresh token.
     * Returns full LoginResult so the client can re-hydrate role/storeId if needed.
     */
    public LoginResult refresh(String refreshToken) {
        var claims = jwtService.validateToken(refreshToken);
        UUID userId = UUID.fromString(claims.getSubject());
        StoreUser user = userRepository.findById(userId)
                .filter(StoreUser::isActive)
                .orElseThrow(InvalidCredentialsException::new);
        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getRole(), user.getStoreId());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());
        return new LoginResult(newAccessToken, newRefreshToken, user.getRole(), user.getStoreId());
    }
}
