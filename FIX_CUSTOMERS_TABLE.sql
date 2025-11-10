-- Fix customers table by adding missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns if they don't exist
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}'::jsonb,
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS lifetime_value DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS average_booking_value DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_booking_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- If you have a 'name' column, split it into first_name and last_name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
        -- Update first_name and last_name from name column
        UPDATE public.customers 
        SET 
            first_name = SPLIT_PART(name, ' ', 1),
            last_name = CASE 
                WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
                THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
                ELSE SPLIT_PART(name, ' ', 1)
            END
        WHERE first_name IS NULL OR last_name IS NULL;
    END IF;
END $$;

-- Make first_name and last_name NOT NULL after populating them
UPDATE public.customers SET first_name = 'Unknown' WHERE first_name IS NULL OR first_name = '';
UPDATE public.customers SET last_name = 'Unknown' WHERE last_name IS NULL OR last_name = '';

ALTER TABLE public.customers 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN email SET NOT NULL;

-- Add check constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_customer_type_check') THEN
        ALTER TABLE public.customers 
        ADD CONSTRAINT customers_customer_type_check 
        CHECK (customer_type IN ('individual', 'group', 'corporate'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_status_check') THEN
        ALTER TABLE public.customers 
        ADD CONSTRAINT customers_status_check 
        CHECK (status IN ('active', 'inactive', 'blacklisted'));
    END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at 
BEFORE UPDATE ON public.customers
FOR EACH ROW 
EXECUTE FUNCTION update_customers_updated_at();

-- Grant permissions
GRANT ALL ON public.customers TO authenticated;
GRANT SELECT ON public.customers TO anon;
GRANT ALL ON public.customers TO service_role;
