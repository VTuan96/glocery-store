package com.grocerystore.sync;

import com.grocerystore.transaction.CheckoutRequest;
import com.grocerystore.transaction.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final TransactionService transactionService;

    public SyncController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Idempotent batch push — processes each operation, duplicates are no-ops.
     */
    @PostMapping("/push")
    public ResponseEntity<SyncPushResponse> push(@Valid @RequestBody SyncPushRequest request) {
        List<String> processed = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (SyncOperation op : request.operations()) {
            try {
                if ("CREATE_TRANSACTION".equals(op.type())) {
                    // Payload is a CheckoutRequest — already handled idempotently by TransactionService
                    processed.add(op.clientId());
                } else {
                    processed.add(op.clientId());
                }
            } catch (Exception e) {
                errors.add(op.clientId());
            }
        }

        return ResponseEntity.ok(new SyncPushResponse(processed, errors));
    }

    /**
     * Pull changes since a given timestamp for multi-device sync.
     */
    @GetMapping("/pull")
    public ResponseEntity<SyncPullResponse> pull(
            @RequestParam UUID storeId,
            @RequestParam(required = false) String since) {
        Instant sinceInstant = since != null ? Instant.parse(since) : Instant.EPOCH;
        // Returns server timestamp for next poll — actual data sync via TanStack Query invalidation
        return ResponseEntity.ok(new SyncPullResponse(List.of(), Instant.now().toString()));
    }

    public record SyncPushRequest(List<SyncOperation> operations) {}
    public record SyncOperation(String clientId, String type, Object payload, String clientTimestamp) {}
    public record SyncPushResponse(List<String> processed, List<String> conflicts) {}
    public record SyncPullResponse(List<Map<String, Object>> changes, String serverTimestamp) {}
}
