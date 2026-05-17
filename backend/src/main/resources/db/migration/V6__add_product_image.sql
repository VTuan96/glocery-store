-- V6: add optional image_url to products

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_products_image_url ON products (image_url);
