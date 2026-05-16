package com.grocerystore.customer;

import java.util.UUID;

public record CustomerResponse(UUID id, String name, String phone, long debtBalance) {
    public static CustomerResponse from(Customer c, long balance) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(), balance);
    }
}
