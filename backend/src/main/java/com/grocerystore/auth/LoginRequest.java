package com.grocerystore.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record LoginRequest(
        @NotBlank String pin,
        @NotNull UserRole role,
        @NotNull UUID storeId
) {}
