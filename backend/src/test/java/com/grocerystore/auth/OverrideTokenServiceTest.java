package com.grocerystore.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OverrideTokenServiceTest {

    @Mock StoreUserRepository userRepository;
    @Mock OverrideTokenRepository overrideTokenRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @InjectMocks OverrideTokenService overrideTokenService;

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
    void issueToken_validPin_returnsToken() {
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.of(activeOwner()));
        when(passwordEncoder.matches("1234", "$hashed$")).thenReturn(true);
        when(overrideTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        OverrideTokenService.IssuedToken result = overrideTokenService.issueToken("1234", storeId);

        assertNotNull(result.token());
        assertTrue(result.expiresAt().isAfter(Instant.now()));
    }

    @Test
    void issueToken_wrongPin_throwsInvalidCredentials() {
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.of(activeOwner()));
        when(passwordEncoder.matches("9999", "$hashed$")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> overrideTokenService.issueToken("9999", storeId));
    }

    @Test
    void issueToken_noOwner_throwsInvalidCredentials() {
        when(userRepository.findByStoreIdAndRoleAndActiveTrue(storeId, UserRole.OWNER))
                .thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class,
                () -> overrideTokenService.issueToken("1234", storeId));
    }

    @Test
    void validateAndConsume_validToken_marksUsed() {
        UUID tokenValue = UUID.randomUUID();
        OverrideToken entity = new OverrideToken();
        entity.setToken(tokenValue);
        entity.setExpiresAt(Instant.now().plusSeconds(60));
        entity.setUsed(false);

        when(overrideTokenRepository.findByTokenAndUsedFalse(tokenValue))
                .thenReturn(Optional.of(entity));
        when(overrideTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        overrideTokenService.validateAndConsume(tokenValue);

        ArgumentCaptor<OverrideToken> captor = ArgumentCaptor.forClass(OverrideToken.class);
        verify(overrideTokenRepository).save(captor.capture());
        assertTrue(captor.getValue().isUsed());
    }

    @Test
    void validateAndConsume_expiredToken_throwsInvalidOverrideToken() {
        UUID tokenValue = UUID.randomUUID();
        OverrideToken entity = new OverrideToken();
        entity.setToken(tokenValue);
        entity.setExpiresAt(Instant.now().minusSeconds(1));
        entity.setUsed(false);

        when(overrideTokenRepository.findByTokenAndUsedFalse(tokenValue))
                .thenReturn(Optional.of(entity));

        assertThrows(InvalidOverrideTokenException.class,
                () -> overrideTokenService.validateAndConsume(tokenValue));
    }

    @Test
    void validateAndConsume_tokenNotFound_throwsInvalidOverrideToken() {
        UUID tokenValue = UUID.randomUUID();
        when(overrideTokenRepository.findByTokenAndUsedFalse(tokenValue))
                .thenReturn(Optional.empty());

        assertThrows(InvalidOverrideTokenException.class,
                () -> overrideTokenService.validateAndConsume(tokenValue));
    }
}
