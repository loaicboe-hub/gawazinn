-- GAWAZ INN 2.0 — Multi-Vendor Product Listings (SQLite)

ALTER TABLE products ADD COLUMN vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
