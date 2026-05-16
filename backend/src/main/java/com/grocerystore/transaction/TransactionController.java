package com.grocerystore.transaction;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<TransactionResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        Transaction tx = transactionService.checkout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponse.from(tx));
    }
}
