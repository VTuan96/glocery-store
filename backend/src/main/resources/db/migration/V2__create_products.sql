-- V2: Product catalog tables
-- products.stock_quantity and inventory_tracked included now for Phase 2 readiness (no breaking migration later)

CREATE TABLE IF NOT EXISTS products (
    id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id            UUID        NOT NULL,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    name                VARCHAR(255) NOT NULL,
    type                VARCHAR(50)  NOT NULL,
    default_price       BIGINT       NOT NULL,
    stock_quantity      INTEGER,
    inventory_tracked   BOOLEAN      NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS barcodes (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    product_id  UUID        NOT NULL REFERENCES products(id),
    code        VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS pack_units (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    product_id  UUID        NOT NULL REFERENCES products(id),
    name        VARCHAR(255) NOT NULL,
    quantity    INTEGER      NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_tiers (
    id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id     UUID        NOT NULL,
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    product_id   UUID        NOT NULL REFERENCES products(id),
    min_quantity INTEGER      NOT NULL,
    unit_price   BIGINT       NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_store_id    ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_barcodes_code        ON barcodes(code);
CREATE INDEX IF NOT EXISTS idx_barcodes_product_id  ON barcodes(product_id);
