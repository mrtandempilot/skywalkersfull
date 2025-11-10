-- Fix Row Level Security policies for pilots table
-- Run this in Supabase SQL Editor

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to insert pilots" ON public.pilots;
DROP POLICY IF EXISTS "Allow authenticated users to read pilots" ON public.pilots;
DROP POLICY IF EXISTS "Allow authenticated users to update pilots" ON public.pilots;
DROP POLICY IF EXISTS "Allow authenticated users to delete pilots" ON public.pilots;
DROP POLICY IF EXISTS "Allow service role full access to pilots" ON public.pilots;

-- Create new policies

-- Allow authenticated users to insert pilots
CREATE POLICY "Allow authenticated users to insert pilots"
ON public.pilots
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read all pilots
CREATE POLICY "Allow authenticated users to read pilots"
ON public.pilots
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update pilots
CREATE POLICY "Allow authenticated users to update pilots"
ON public.pilots
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete pilots
CREATE POLICY "Allow authenticated users to delete pilots"
ON public.pilots
FOR DELETE
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to pilots"
ON public.pilots
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.pilots TO authenticated;
GRANT ALL ON public.pilots TO service_role;

-- Ensure RLS is enabled
ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;
