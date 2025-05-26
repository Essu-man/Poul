export const createtasks = `
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    priority TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
`