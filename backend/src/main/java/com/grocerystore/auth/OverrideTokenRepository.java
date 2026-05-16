package com.grocerystore.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OverrideTokenRepository extends JpaRepository<OverrideToken, UUID> {
    Optional<OverrideToken> findByTokenAndUsedFalse(UUID token);
}
