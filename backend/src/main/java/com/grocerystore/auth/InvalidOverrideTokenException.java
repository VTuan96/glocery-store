package com.grocerystore.auth;

public class InvalidOverrideTokenException extends RuntimeException {
    public InvalidOverrideTokenException() {
        super("Mã xác nhận không hợp lệ hoặc đã hết hạn");
    }
}
