package com.grocerystore.product;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock ProductRepository productRepository;
    @Mock BarcodeRepository barcodeRepository;
    @InjectMocks ProductService productService;

    private final UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Test
    void create_basicProduct_savesAndReturns() {
        ProductRequest req = new ProductRequest("Nước ngọt", ProductType.NORMAL, 15000L, storeId, null, null, null);
        Product saved = new Product();
        saved.setName("Nước ngọt");
        when(productRepository.save(any())).thenReturn(saved);

        Product result = productService.create(req);
        assertEquals("Nước ngọt", result.getName());
    }

    @Test
    void create_duplicateBarcode_throwsDuplicateBarcodeException() {
        Barcode existing = new Barcode();
        Product otherProduct = new Product();
        otherProduct.setName("Other");
        existing.setProduct(otherProduct);

        when(barcodeRepository.findByCode("123")).thenReturn(Optional.of(existing));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProductRequest req = new ProductRequest("Test", ProductType.NORMAL, 1000L, storeId,
                List.of("123"), null, null);

        assertThrows(DuplicateBarcodeException.class, () -> productService.create(req));
    }

    @Test
    void list_withSearch_callsSearchQuery() {
        when(productRepository.findByStoreIdAndNameContainingIgnoreCase(storeId, "nước"))
                .thenReturn(List.of());
        productService.list(storeId, "nước");
        verify(productRepository).findByStoreIdAndNameContainingIgnoreCase(storeId, "nước");
    }

    @Test
    void findByBarcode_notFound_throwsIllegalArgument() {
        when(productRepository.findByBarcodeAndStoreId("999", storeId)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> productService.findByBarcode("999", storeId));
    }
}
