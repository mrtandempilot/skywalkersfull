-- Enable Row Level Security on the tours table
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read tours (public access)
CREATE POLICY "Allow public read access to tours"
ON tours
FOR SELECT
USING (true);

-- Optional: If you want to allow authenticated users to insert/update/delete
-- Uncomment these policies if needed:

-- CREATE POLICY "Allow authenticated users to insert tours"
-- ON tours
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (true);

-- CREATE POLICY "Allow authenticated users to update tours"
-- ON tours
-- FOR UPDATE
-- TO authenticated
-- USING (true);

-- CREATE POLICY "Allow authenticated users to delete tours"
-- ON tours
-- FOR DELETE
-- TO authenticated
-- USING (true);
