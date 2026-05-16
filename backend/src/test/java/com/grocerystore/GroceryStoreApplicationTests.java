package com.grocerystore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class GroceryStoreApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring application context starts without errors.
        // This is the baseline test for Story 1.1 — all beans wire correctly.
    }
}
