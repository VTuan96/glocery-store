-- V3: Customer and debt tables
-- debt_records is append-only: INSERT only, no UPDATE or DELETE

CREATE TABLE IF NOT EXISTS customers (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS debt_records (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    customer_id UUID        NOT NULL REFERENCES customers(id),
    type        VARCHAR(50)  NOT NULL,
    amount      BIGINT       NOT NULL,
    note        TEXT
);

COMMENT ON TABLE debt_records IS 'Append-only. No UPDATE or DELETE. Corrections via explicit ADJUSTMENT entries.';

CREATE INDEX IF NOT EXISTS idx_customers_store_id       ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_debt_records_customer_id ON debt_records(customer_id);
