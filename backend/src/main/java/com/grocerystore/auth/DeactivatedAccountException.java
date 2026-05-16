package com.grocerystore.auth;

public class DeactivatedAccountException extends RuntimeException {
    public DeactivatedAccountException() {
        super("Tài khoản đã bị vô hiệu hoá");
    }
}
