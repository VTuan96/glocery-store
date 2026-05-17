package com.grocerystore.product;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.PathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

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

    @PostMapping("/{productId}/image")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProductResponse> uploadImage(@PathVariable UUID productId,
                                                       @RequestParam("file") MultipartFile file) throws IOException {
        Path uploadDir = Paths.get("uploads/product-images");
        Files.createDirectories(uploadDir);
        String original = file.getOriginalFilename();
        String ext = null;
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.') + 1);
        }
        String filename = productId.toString() + (ext != null ? "." + ext : "");
        Path target = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Expose via controller endpoint
        String imageEndpoint = "/api/v1/products/" + productId + "/image/content";
        Product updated = productService.setImageUrl(productId, imageEndpoint);
        return ResponseEntity.ok(ProductResponse.from(updated));
    }

    @GetMapping("/{productId}/image/content")
    public ResponseEntity<Resource> serveImage(@PathVariable UUID productId) throws IOException {
        Path dir = Paths.get("uploads/product-images");
        if (!Files.exists(dir)) {
            return ResponseEntity.notFound().build();
        }
        try (var stream = Files.list(dir)) {
            var matcher = stream
                    .filter(p -> p.getFileName().toString().startsWith(productId.toString()))
                    .findFirst();
            if (matcher.isEmpty()) return ResponseEntity.notFound().build();
            Path img = matcher.get();
            String contentType = Files.probeContentType(img);
            Resource resource = new PathResource(img.toAbsolutePath());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + img.getFileName().toString() + "\"")
                    .contentType(contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        }
    }
}
