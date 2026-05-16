package com.grocerystore.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ProductRequest(
        @NotBlank String name,
        @NotNull ProductType type,
        @Min(0) long defaultPrice,
        @NotNull UUID storeId,
        List<String> barcodes,
        List<PackUnitDto> packUnits,
        List<PricingTierDto> pricingTiers
) {
    public record PackUnitDto(String name, int quantity, String barcode) {}
    public record PricingTierDto(int minQuantity, long unitPrice) {}
}
