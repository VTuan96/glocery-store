package com.grocerystore.auth;

import java.util.UUID;

public record UserResponse(UUID id, String name, UserRole role, boolean active) {
    public static UserResponse from(StoreUser u) {
        return new UserResponse(u.getId(), u.getName(), u.getRole(), u.isActive());
    }
}
