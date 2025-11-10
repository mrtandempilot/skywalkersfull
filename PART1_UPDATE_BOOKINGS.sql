-- ============================================
-- PART 1: UPDATE BOOKINGS TABLE
-- Run this first!
-- ============================================

-- Add missing columns to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update NULL values
UPDATE public.bookings SET status = 'pending' WHERE status IS NULL;
UPDATE public.bookings SET user_name = customer_name WHERE user_name IS NULL AND customer_name IS NOT NULL;
UPDATE public.bookings SET user_email = customer_email WHERE user_email IS NULL AND customer_email IS NOT NULL;
UPDATE public.bookings SET participants = COALESCE(adults, 0) + COALESCE(children, 0) WHERE participants IS NULL OR participants = 1;
UPDATE public.bookings SET participants = 1 WHERE participants < 1;
