package com.grocerystore.debt;

import com.grocerystore.customer.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/debt-records")
public class DebtController {

    private final DebtService debtService;
    private final CustomerService customerService;

    public DebtController(DebtService debtService, CustomerService customerService) {
        this.debtService = debtService;
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<DebtRecordResponse> record(@Valid @RequestBody DebtRecordRequest request) {
        // PAYMENT and ADJUSTMENT are owner-only; DEBT can be recorded by staff at checkout
        if (request.type() != DebtRecordType.DEBT) {
            // Spring Security @PreAuthorize on method level would require a separate endpoint;
            // check role from security context instead
            var auth = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            boolean isOwner = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));
            if (!isOwner) {
                return ResponseEntity.status(403).build();
            }
        }
        DebtRecord dr = debtService.record(
                request.storeId(), request.customerId(), request.type(), request.amount(), request.note());
        return ResponseEntity.status(HttpStatus.CREATED).body(DebtRecordResponse.from(dr));
    }

    @GetMapping("/customer/{customerId}/balance")
    public BalanceResponse getBalance(@PathVariable UUID customerId) {
        return new BalanceResponse(customerId, debtService.getBalance(customerId));
    }

    @GetMapping("/customer/{customerId}/history")
    @PreAuthorize("hasRole('OWNER')")
    public List<DebtRecordResponse> getHistory(@PathVariable UUID customerId) {
        return debtService.getHistory(customerId).stream().map(DebtRecordResponse::from).toList();
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('OWNER')")
    public List<CustomerBalanceDto> getOverview(@RequestParam UUID storeId) {
        return debtService.getAllBalances(storeId).stream()
                .filter(row -> row[1] != null && ((Number) row[1]).longValue() > 0)
                .map(row -> {
                    UUID customerId = (UUID) row[0];
                    long balance = ((Number) row[1]).longValue();
                    var customer = customerService.findById(customerId);
                    return new CustomerBalanceDto(customerId, customer.getName(), balance);
                })
                .sorted((a, b) -> Long.compare(b.balance(), a.balance()))
                .toList();
    }

    public record DebtRecordRequest(
            @NotNull UUID storeId, @NotNull UUID customerId,
            @NotNull DebtRecordType type, @Min(1) long amount, String note) {}

    public record BalanceResponse(UUID customerId, long balance) {}
    public record CustomerBalanceDto(UUID customerId, String name, long balance) {}
}
