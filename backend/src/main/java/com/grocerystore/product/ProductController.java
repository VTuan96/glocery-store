package com.grocerystore.product;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> list(@RequestParam UUID storeId,
                                      @RequestParam(required = false) String search) {
        return productService.list(storeId, search).stream().map(ProductResponse::from).toList();
    }

    @GetMapping("/barcode/{code}")
    public ProductResponse findByBarcode(@PathVariable String code, @RequestParam UUID storeId) {
        return ProductResponse.from(productService.findByBarcode(code, storeId));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProductResponse.from(productService.create(request)));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('OWNER')")
    public ProductResponse update(@PathVariable UUID productId,
                                  @Valid @RequestBody ProductRequest request) {
        return ProductResponse.from(productService.update(productId, request));
    }
}
