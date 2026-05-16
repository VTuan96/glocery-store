package com.grocerystore.debt;

import java.time.Instant;
import java.util.UUID;

public record DebtRecordResponse(UUID id, UUID customerId, DebtRecordType type, long amount, String note, Instant createdAt) {
    public static DebtRecordResponse from(DebtRecord dr) {
        return new DebtRecordResponse(dr.getId(), dr.getCustomerId(), dr.getType(), dr.getAmount(), dr.getNote(), dr.getCreatedAt());
    }
}
