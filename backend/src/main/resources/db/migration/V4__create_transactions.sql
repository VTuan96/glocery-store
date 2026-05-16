-- V4: Transaction tables
-- transactions is append-only: INSERT only, no UPDATE or DELETE
-- client_id is the client-generated UUID for idempotent sync (duplicate = no-op)

CREATE TABLE IF NOT EXISTS transactions (
    id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id        UUID        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    customer_id     UUID        REFERENCES customers(id),
    type            VARCHAR(50)  NOT NULL,
    total_amount    BIGINT       NOT NULL,
    client_id       VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id        UUID        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    transaction_id  UUID        NOT NULL REFERENCES transactions(id),
    product_id      UUID        NOT NULL REFERENCES products(id),
    quantity        INTEGER      NOT NULL,
    unit_price      BIGINT       NOT NULL,
    total_price     BIGINT       NOT NULL,
    price_overridden BOOLEAN     NOT NULL DEFAULT false
);

COMMENT ON TABLE transactions IS 'Append-only. No UPDATE or DELETE. Corrections via explicit adjustment entries.';

CREATE INDEX IF NOT EXISTS idx_transactions_store_id  ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
