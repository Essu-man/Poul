import { sql } from 'drizzle-orm';

export const createEggProduction = `
  CREATE TABLE IF NOT EXISTS egg_production (
    date DATE PRIMARY KEY,
    peewee_crates INTEGER NOT NULL DEFAULT 0,
    peewee_pieces INTEGER NOT NULL DEFAULT 0,
    small_crates INTEGER NOT NULL DEFAULT 0,
    small_pieces INTEGER NOT NULL DEFAULT 0,
    medium_crates INTEGER NOT NULL DEFAULT 0,
    medium_pieces INTEGER NOT NULL DEFAULT 0,
    large_crates INTEGER NOT NULL DEFAULT 0,
    large_pieces INTEGER NOT NULL DEFAULT 0,
    extra_large_crates INTEGER NOT NULL DEFAULT 0,
    extra_large_pieces INTEGER NOT NULL DEFAULT 0,
    jumbo_crates INTEGER NOT NULL DEFAULT 0,
    jumbo_pieces INTEGER NOT NULL DEFAULT 0
  );
`;