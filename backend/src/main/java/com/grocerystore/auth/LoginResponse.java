package com.grocerystore.auth;

import java.util.UUID;

public record LoginResponse(String accessToken, UserRole role, UUID storeId) {}
