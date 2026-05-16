package com.grocerystore.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserRequest(
        @NotBlank String name,
        @NotBlank @Size(min = 4, max = 8) String pin,
        @NotNull UUID storeId
) {}
