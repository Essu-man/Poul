import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createEggProduction } from './0000_create_egg_production';
import { createtasks } from './0001_create_tasks';
import { createUsers } from './0002_create_users';

// Load environment variables
config();

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // Execute the raw SQL directly as a string
    await client.unsafe(createEggProduction);
    // Inside runMigration function, add:
    await client.unsafe(createtasks);
    await client.unsafe(createUsers);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
};

runMigration();