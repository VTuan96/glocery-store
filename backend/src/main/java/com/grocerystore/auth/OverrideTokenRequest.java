package com.grocerystore.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OverrideTokenRequest(
        @NotBlank String ownerPin,
        @NotNull UUID storeId
) {}
