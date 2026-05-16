package com.grocerystore.product;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BarcodeRepository barcodeRepository;

    public ProductService(ProductRepository productRepository, BarcodeRepository barcodeRepository) {
        this.productRepository = productRepository;
        this.barcodeRepository = barcodeRepository;
    }

    public List<Product> list(UUID storeId, String search) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByStoreIdAndNameContainingIgnoreCase(storeId, search);
        }
        return productRepository.findByStoreId(storeId);
    }

    @Transactional
    public Product create(ProductRequest req) {
        Product product = new Product();
        product.setStoreId(req.storeId());
        applyRequest(product, req);
        return productRepository.save(product);
    }

    @Transactional
    public Product update(UUID productId, ProductRequest req) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        applyRequest(product, req);
        return productRepository.save(product);
    }

    public Product findByBarcode(String code, UUID storeId) {
        return productRepository.findByBarcodeAndStoreId(code, storeId)
                .orElseThrow(() -> new IllegalArgumentException("Barcode not found: " + code));
    }

    private void applyRequest(Product product, ProductRequest req) {
        product.setName(req.name());
        product.setType(req.type());
        product.setDefaultPrice(req.defaultPrice());

        // Barcodes
        product.getBarcodes().clear();
        if (req.barcodes() != null) {
            for (String code : req.barcodes()) {
                barcodeRepository.findByCode(code).ifPresent(existing -> {
                    if (!existing.getProduct().getId().equals(product.getId())) {
                        throw new DuplicateBarcodeException(code, existing.getProduct().getName());
                    }
                });
                Barcode b = new Barcode();
                b.setStoreId(product.getStoreId());
                b.setCode(code);
                b.setProduct(product);
                product.getBarcodes().add(b);
            }
        }

        // Pack units
        product.getPackUnits().clear();
        if (req.packUnits() != null) {
            for (var dto : req.packUnits()) {
                PackUnit pu = new PackUnit();
                pu.setStoreId(product.getStoreId());
                pu.setName(dto.name());
                pu.setQuantity(dto.quantity());
                pu.setProduct(product);
                product.getPackUnits().add(pu);
            }
        }

        // Pricing tiers
        product.getPricingTiers().clear();
        if (req.pricingTiers() != null) {
            for (var dto : req.pricingTiers()) {
                PricingTier tier = new PricingTier();
                tier.setStoreId(product.getStoreId());
                tier.setMinQuantity(dto.minQuantity());
                tier.setUnitPrice(dto.unitPrice());
                tier.setProduct(product);
                product.getPricingTiers().add(tier);
            }
        }
    }
}
