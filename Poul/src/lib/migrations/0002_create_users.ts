export const createUsers = `
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
` 