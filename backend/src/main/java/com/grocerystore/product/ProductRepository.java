package com.grocerystore.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByStoreId(UUID storeId);
    List<Product> findByStoreIdAndNameContainingIgnoreCase(UUID storeId, String name);

    @Query("SELECT p FROM Product p JOIN p.barcodes b WHERE b.code = :code AND p.storeId = :storeId")
    Optional<Product> findByBarcodeAndStoreId(String code, UUID storeId);
}
