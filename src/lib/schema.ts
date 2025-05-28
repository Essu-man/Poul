import { date, integer, serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const eggProduction = pgTable('egg_production', {
  date: date('date').primaryKey(),
  peewee_crates: integer('peewee_crates').notNull().default(0),
  peewee_pieces: integer('peewee_pieces').notNull().default(0),
  small_crates: integer('small_crates').notNull().default(0),
  small_pieces: integer('small_pieces').notNull().default(0),
  medium_crates: integer('medium_crates').notNull().default(0),
  medium_pieces: integer('medium_pieces').notNull().default(0),
  large_crates: integer('large_crates').notNull().default(0),
  large_pieces: integer('large_pieces').notNull().default(0),
  extra_large_crates: integer('extra_large_crates').notNull().default(0),
  extra_large_pieces: integer('extra_large_pieces').notNull().default(0),
  jumbo_crates: integer('jumbo_crates').notNull().default(0),
  jumbo_pieces: integer('jumbo_pieces').notNull().default(0),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  time: text('time').notNull(),
  priority: text('priority').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  completed: integer('completed').notNull().default(0),
  created_at: timestamp('created_at').defaultNow()
});