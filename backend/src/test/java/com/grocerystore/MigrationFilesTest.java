package com.grocerystore;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Validates that all required Flyway migration files exist and contain
 * the expected table definitions. Does not require a running database.
 */
class MigrationFilesTest {

    private static final List<String> REQUIRED_MIGRATIONS = List.of(
            "db/migration/V1__create_base_tables.sql",
            "db/migration/V2__create_products.sql",
            "db/migration/V3__create_customers_debt.sql",
            "db/migration/V4__create_transactions.sql"
    );

    @Test
    void allMigrationFilesExist() {
        for (String path : REQUIRED_MIGRATIONS) {
            assertTrue(new ClassPathResource(path).exists(),
                    "Missing migration file: " + path);
        }
    }

    @Test
    void v1ContainsStoreUsersTable() throws IOException {
        String sql = readMigration("db/migration/V1__create_base_tables.sql");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS store_users"), "V1 must create store_users");
        assertTrue(sql.contains("store_id"), "store_users must have store_id");
        assertTrue(sql.contains("pin_hash"), "store_users must have pin_hash");
        assertTrue(sql.contains("role"), "store_users must have role");
    }

    @Test
    void v2ContainsProductsWithInventoryFields() throws IOException {
        String sql = readMigration("db/migration/V2__create_products.sql");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS products"), "V2 must create products");
        assertTrue(sql.contains("stock_quantity"), "products must have stock_quantity");
        assertTrue(sql.contains("inventory_tracked"), "products must have inventory_tracked");
        assertTrue(sql.contains("default_price"), "products must have default_price");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS barcodes"), "V2 must create barcodes");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS pack_units"), "V2 must create pack_units");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS pricing_tiers"), "V2 must create pricing_tiers");
    }

    @Test
    void v3ContainsCustomersAndDebtRecordsWithAppendOnlyComment() throws IOException {
        String sql = readMigration("db/migration/V3__create_customers_debt.sql");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS customers"), "V3 must create customers");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS debt_records"), "V3 must create debt_records");
        assertTrue(sql.contains("COMMENT ON TABLE debt_records"), "debt_records must have append-only comment");
    }

    @Test
    void v4ContainsTransactionsWithClientIdAndAppendOnlyComment() throws IOException {
        String sql = readMigration("db/migration/V4__create_transactions.sql");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS transactions"), "V4 must create transactions");
        assertTrue(sql.contains("client_id"), "transactions must have client_id for idempotency");
        assertTrue(sql.contains("UNIQUE"), "client_id must be UNIQUE");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS transaction_items"), "V4 must create transaction_items");
        assertTrue(sql.contains("COMMENT ON TABLE transactions"), "transactions must have append-only comment");
    }

    @Test
    void allTablesHaveStandardColumns() throws IOException {
        for (String path : REQUIRED_MIGRATIONS) {
            String sql = readMigration(path);
            assertTrue(sql.contains("store_id"), path + " must include store_id column");
            assertTrue(sql.contains("created_at"), path + " must include created_at column");
            assertTrue(sql.contains("updated_at"), path + " must include updated_at column");
            assertTrue(sql.contains("gen_random_uuid()"), path + " must use gen_random_uuid() for id");
        }
    }

    private String readMigration(String path) throws IOException {
        return Files.readString(new ClassPathResource(path).getFile().toPath());
    }
}
