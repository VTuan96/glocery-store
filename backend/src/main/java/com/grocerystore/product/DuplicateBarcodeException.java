package com.grocerystore.product;

public class DuplicateBarcodeException extends RuntimeException {
    public DuplicateBarcodeException(String code, String productName) {
        super("Mã vạch đã được dùng cho " + productName);
    }
}
