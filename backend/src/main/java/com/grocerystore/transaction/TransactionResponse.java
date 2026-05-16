package com.grocerystore.transaction;

import java.util.List;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        String clientId,
        TransactionType type,
        long totalAmount,
        UUID customerId,
        List<ItemDto> items
) {
    public record ItemDto(UUID productId, int quantity, long unitPrice, long totalPrice, boolean priceOverridden) {}

    public static TransactionResponse from(Transaction tx) {
        return new TransactionResponse(
                tx.getId(), tx.getClientId(), tx.getType(), tx.getTotalAmount(), tx.getCustomerId(),
                tx.getItems().stream().map(i -> new ItemDto(
                        i.getProductId(), i.getQuantity(), i.getUnitPrice(), i.getTotalPrice(), i.isPriceOverridden()
                )).toList()
        );
    }
}
