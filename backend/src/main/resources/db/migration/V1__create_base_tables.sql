-- V1: Base tables — store_users
-- All tables follow: id UUID PK, store_id UUID NOT NULL, created_at, updated_at

CREATE TABLE IF NOT EXISTS store_users (
    id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id    UUID        NOT NULL,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    name        VARCHAR(255) NOT NULL,
    pin_hash    VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_store_users_store_id ON store_users(store_id);
