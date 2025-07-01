"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEggProduction = void 0;
exports.createEggProduction = "\n  CREATE TABLE IF NOT EXISTS egg_production (\n    date DATE PRIMARY KEY,\n    peewee_crates INTEGER NOT NULL DEFAULT 0,\n    peewee_pieces INTEGER NOT NULL DEFAULT 0,\n    small_crates INTEGER NOT NULL DEFAULT 0,\n    small_pieces INTEGER NOT NULL DEFAULT 0,\n    medium_crates INTEGER NOT NULL DEFAULT 0,\n    medium_pieces INTEGER NOT NULL DEFAULT 0,\n    large_crates INTEGER NOT NULL DEFAULT 0,\n    large_pieces INTEGER NOT NULL DEFAULT 0,\n    extra_large_crates INTEGER NOT NULL DEFAULT 0,\n    extra_large_pieces INTEGER NOT NULL DEFAULT 0,\n    jumbo_crates INTEGER NOT NULL DEFAULT 0,\n    jumbo_pieces INTEGER NOT NULL DEFAULT 0\n  );\n";
