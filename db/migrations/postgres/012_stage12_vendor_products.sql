-- GAWAZ INN 2.0 — Multi-Vendor Product Listings (PostgreSQL)

ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

