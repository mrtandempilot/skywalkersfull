-- Fix Row Level Security policies for customers table
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled (it should be)
-- If you want to disable RLS temporarily for testing, uncomment this:
-- ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- But it's better to add proper policies:

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users to read customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow service role full access to customers" ON public.customers;

-- Create new policies

-- Allow authenticated users to insert customers
CREATE POLICY "Allow authenticated users to insert customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read all customers
CREATE POLICY "Allow authenticated users to read customers"
ON public.customers
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update customers
CREATE POLICY "Allow authenticated users to update customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete customers
CREATE POLICY "Allow authenticated users to delete customers"
ON public.customers
FOR DELETE
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to customers"
ON public.customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

-- Ensure RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
