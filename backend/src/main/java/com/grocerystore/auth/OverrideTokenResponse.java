package com.grocerystore.auth;

import java.time.Instant;
import java.util.UUID;

public record OverrideTokenResponse(UUID token, Instant expiresAt) {}
