package com.grocerystore.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
        @NotBlank String clientId,
        @NotNull UUID storeId,
        @NotNull TransactionType type,
        UUID customerId,
        String overrideToken,
        @NotEmpty List<ItemDto> items
) {
    public record ItemDto(
            @NotNull UUID productId,
            int quantity,
            long unitPrice,
            boolean priceOverridden
    ) {}
}
