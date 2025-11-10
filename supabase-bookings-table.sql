-- Update existing bookings table or create if not exists
-- This matches your current database schema

-- Add missing columns to existing bookings table if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS participants INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update user_name from customer_name if empty
UPDATE public.bookings 
SET user_name = customer_name 
WHERE user_name IS NULL AND customer_name IS NOT NULL;

-- Update user_email from customer_email if empty
UPDATE public.bookings 
SET user_email = customer_email 
WHERE user_email IS NULL AND customer_email IS NOT NULL;

-- Calculate participants from adults and children
UPDATE public.bookings 
SET participants = COALESCE(adults, 0) + COALESCE(children, 0)
WHERE participants IS NULL OR participants = 1;

-- Ensure participants is at least 1
UPDATE public.bookings 
SET participants = 1 
WHERE participants < 1;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;

-- Create new policies
CREATE POLICY "Users can view own bookings"
    ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own bookings"
    ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
    ON public.bookings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
    ON public.bookings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp if it exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for updated_at  
DROP TRIGGER IF EXISTS set_updated_at ON public.bookings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

-- Add comment
COMMENT ON TABLE public.bookings IS 'Bookings table with Google Calendar integration support';
