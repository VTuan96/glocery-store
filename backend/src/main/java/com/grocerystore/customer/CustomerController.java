package com.grocerystore.customer;

import com.grocerystore.debt.DebtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final DebtService debtService;

    public CustomerController(CustomerService customerService, DebtService debtService) {
        this.customerService = customerService;
        this.debtService = debtService;
    }

    @GetMapping
    public List<CustomerResponse> search(@RequestParam UUID storeId,
                                         @RequestParam(required = false) String name) {
        return customerService.search(storeId, name).stream()
                .map(c -> CustomerResponse.from(c, debtService.getBalance(c.getId())))
                .toList();
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        Customer c = customerService.create(request.storeId(), request.name(), request.phone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CustomerResponse.from(c, 0L));
    }

    @GetMapping("/{customerId}")
    public CustomerResponse get(@PathVariable UUID customerId) {
        Customer c = customerService.findById(customerId);
        return CustomerResponse.from(c, debtService.getBalance(customerId));
    }

    public record CustomerRequest(@NotNull UUID storeId, @NotBlank String name, String phone) {}
}
