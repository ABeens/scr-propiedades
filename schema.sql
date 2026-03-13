DROP TABLE IF EXISTS properties;

CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  price_display TEXT NOT NULL,
  price_usd REAL NOT NULL,
  price_display_usd TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'rent')),
  location TEXT NOT NULL,
  provincia_id TEXT,
  canton_id TEXT,
  distrito_id TEXT,
  beds INTEGER NOT NULL DEFAULT 0,
  baths REAL NOT NULL DEFAULT 0,
  area TEXT NOT NULL,
  parking INTEGER NOT NULL DEFAULT 0,
  property_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  description TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  instagram TEXT,
  video TEXT,
  lat REAL,
  lng REAL,
  contact_number TEXT NOT NULL DEFAULT '50670141868',
  featured INTEGER NOT NULL DEFAULT 0,
  code TEXT UNIQUE,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
