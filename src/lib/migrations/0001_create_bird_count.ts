export const createBirdCount = `
  CREATE TABLE IF NOT EXISTS bird_count (
    id INTEGER PRIMARY KEY,
    total INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Healthy population',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Insert initial record if not exists
  INSERT INTO bird_count (id, total, status)
  SELECT 1, 2450, 'Healthy population'
  WHERE NOT EXISTS (SELECT 1 FROM bird_count WHERE id = 1);
`;