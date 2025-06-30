import { date, integer, serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const eggProduction = pgTable('egg_production', {
  user_id: text('user_id').notNull(), // <-- Add this line
  date: date('date').notNull(),
  peewee_crates: integer('peewee_crates'),
  peewee_pieces: integer('peewee_pieces'),
  small_crates: integer('small_crates'),
  small_pieces: integer('small_pieces'),
  medium_crates: integer('medium_crates'),
  medium_pieces: integer('medium_pieces'),
  large_crates: integer('large_crates'),
  large_pieces: integer('large_pieces'),
  extra_large_crates: integer('extra_large_crates'),
  extra_large_pieces: integer('extra_large_pieces'),
  jumbo_crates: integer('jumbo_crates'),
  jumbo_pieces: integer('jumbo_pieces'),
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

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').unique().notNull(),
  role: text('role').notNull().default('employee'),
  name: text('name'),
  created_at: timestamp('created_at').defaultNow()
});