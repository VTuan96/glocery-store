package com.grocerystore.product;

import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        ProductType type,
        long defaultPrice,
        UUID storeId,
    String imageUrl,
        List<String> barcodes,
        List<PackUnitDto> packUnits,
        List<PricingTierDto> pricingTiers
) {
    public record PackUnitDto(UUID id, String name, int quantity) {}
    public record PricingTierDto(UUID id, int minQuantity, long unitPrice) {}

    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getType(), p.getDefaultPrice(), p.getStoreId(),
                p.getImageUrl(),
                p.getBarcodes().stream().map(Barcode::getCode).toList(),
                p.getPackUnits().stream().map(u -> new PackUnitDto(u.getId(), u.getName(), u.getQuantity())).toList(),
                p.getPricingTiers().stream()
                        .sorted((a, b) -> Integer.compare(a.getMinQuantity(), b.getMinQuantity()))
                        .map(t -> new PricingTierDto(t.getId(), t.getMinQuantity(), t.getUnitPrice())).toList()
        );
    }
}
