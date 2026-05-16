package com.grocerystore.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class OverrideTokenService {

    private final StoreUserRepository userRepository;
    private final OverrideTokenRepository overrideTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public OverrideTokenService(StoreUserRepository userRepository,
                                OverrideTokenRepository overrideTokenRepository,
                                BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.overrideTokenRepository = overrideTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record IssuedToken(UUID token, Instant expiresAt) {}

    /**
     * Validates the owner PIN for the given storeId and issues a single-use override token (60s TTL).
     * Throws InvalidCredentialsException if PIN is wrong or no active owner found.
     */
    @Transactional
    public IssuedToken issueToken(String ownerPin, UUID storeId) {
        StoreUser owner = userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(ownerPin, owner.getPinHash())) {
            throw new InvalidCredentialsException();
        }

        OverrideToken entity = new OverrideToken();
        entity.setStoreId(storeId);
        entity.setToken(UUID.randomUUID());
        entity.setExpiresAt(Instant.now().plus(Duration.ofSeconds(60)));
        entity.setUsed(false);
        overrideTokenRepository.save(entity);

        return new IssuedToken(entity.getToken(), entity.getExpiresAt());
    }

    /**
     * Validates and consumes a single-use override token.
     * Throws InvalidOverrideTokenException if token is not found, expired, or already used.
     */
    @Transactional
    public void validateAndConsume(UUID token) {
        OverrideToken entity = overrideTokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(InvalidOverrideTokenException::new);

        if (Instant.now().isAfter(entity.getExpiresAt())) {
            throw new InvalidOverrideTokenException();
        }

        entity.setUsed(true);
        overrideTokenRepository.save(entity);
    }
}
