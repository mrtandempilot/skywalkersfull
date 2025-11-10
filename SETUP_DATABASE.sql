-- ============================================
-- COMPLETE CRM DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: UPDATE BOOKINGS TABLE
-- ============================================

-- Add missing columns to existing bookings table if they don't exist
-- Note: Add columns without CHECK constraint first
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

-- Update NULL status values to 'pending'
UPDATE public.bookings SET status = 'pending' WHERE status IS NULL;

-- Now add the CHECK constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bookings_status_check'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
    END IF;
END $$;

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

-- Wait a moment for the column additions to be committed
COMMIT;
BEGIN;

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

-- Function to automatically update updated_at timestamp
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

-- ============================================
-- PART 2: CREATE CRM TABLES
-- ============================================

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    date_of_birth DATE,
    passport_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'group', 'corporate')),
    vip_status BOOLEAN DEFAULT false,
    tags TEXT[],
    
    preferred_language TEXT DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT false,
    newsletter_subscribed BOOLEAN DEFAULT false,
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}'::jsonb,
    
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    average_booking_value DECIMAL(10,2) DEFAULT 0.00,
    last_booking_date TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    internal_notes TEXT,
    source TEXT,
    referral_source TEXT,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_customer_email UNIQUE(email)
);

-- PILOTS TABLE
CREATE TABLE IF NOT EXISTS public.pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    
    license_number TEXT NOT NULL UNIQUE,
    license_type TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    certifications TEXT[],
    specializations TEXT[],
    
    years_experience INTEGER,
    total_flights INTEGER DEFAULT 0,
    total_tandem_flights INTEGER DEFAULT 0,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')),
    available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
    max_flights_per_day INTEGER DEFAULT 4,
    
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    equipment_owned TEXT[],
    
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'bank_transfer',
    
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TOUR PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.tour_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    seasonal_pricing JSONB,
    
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 1,
    
    min_age INTEGER,
    max_age INTEGER,
    max_weight DECIMAL(5,2),
    fitness_level TEXT,
    restrictions TEXT[],
    
    includes TEXT[],
    equipment_provided TEXT[],
    meeting_point TEXT,
    
    available_days TEXT[],
    available_times TEXT[],
    seasonal_availability JSONB,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'seasonal')),
    featured BOOLEAN DEFAULT false,
    
    slug TEXT UNIQUE,
    image_urls TEXT[],
    video_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMUNICATIONS LOG TABLE
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'phone', 'whatsapp', 'in_person', 'other')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    message TEXT NOT NULL,
    
    sent_by UUID REFERENCES auth.users(id),
    sent_by_name TEXT,
    received_by TEXT,
    
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'read')),
    
    attachments JSONB,
    
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMER INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('inquiry', 'booking', 'complaint', 'feedback', 'support', 'follow_up', 'other')),
    summary TEXT NOT NULL,
    details TEXT,
    
    outcome TEXT,
    action_required BOOLEAN DEFAULT false,
    action_taken TEXT,
    
    handled_by UUID REFERENCES auth.users(id),
    handled_by_name TEXT,
    
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
    
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    pilot_rating INTEGER CHECK (pilot_rating >= 1 AND pilot_rating <= 5),
    experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    title TEXT,
    comment TEXT,
    
    photos TEXT[],
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    featured BOOLEAN DEFAULT false,
    
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON public.customers USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_pilots_email ON public.pilots(email);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON public.pilots(status);
CREATE INDEX IF NOT EXISTS idx_pilots_license ON public.pilots(license_number);

CREATE INDEX IF NOT EXISTS idx_tour_packages_status ON public.tour_packages(status);
CREATE INDEX IF NOT EXISTS idx_tour_packages_slug ON public.tour_packages(slug);

CREATE INDEX IF NOT EXISTS idx_communications_customer ON public.communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_booking ON public.communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at);

CREATE INDEX IF NOT EXISTS idx_interactions_customer ON public.customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON public.customer_interactions(interaction_date);

CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pilot ON public.reviews(pilot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS pilots_updated_at ON public.pilots;
CREATE TRIGGER pilots_updated_at BEFORE UPDATE ON public.pilots
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tour_packages_updated_at ON public.tour_packages;
CREATE TRIGGER tour_packages_updated_at BEFORE UPDATE ON public.tour_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Customers policies
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;

CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Pilots policies
DROP POLICY IF EXISTS "Anyone can view active pilots" ON public.pilots;
DROP POLICY IF EXISTS "Authenticated users can manage pilots" ON public.pilots;

CREATE POLICY "Anyone can view active pilots" ON public.pilots FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage pilots" ON public.pilots FOR ALL USING (auth.uid() IS NOT NULL);

-- Tour packages policies
DROP POLICY IF EXISTS "Anyone can view active tour packages" ON public.tour_packages;
DROP POLICY IF EXISTS "Authenticated users can manage tour packages" ON public.tour_packages;

CREATE POLICY "Anyone can view active tour packages" ON public.tour_packages FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage tour packages" ON public.tour_packages FOR ALL USING (auth.uid() IS NOT NULL);

-- Communications policies
DROP POLICY IF EXISTS "Authenticated users can view communications" ON public.communications;
DROP POLICY IF EXISTS "Authenticated users can insert communications" ON public.communications;

CREATE POLICY "Authenticated users can view communications" ON public.communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert communications" ON public.communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Customer interactions policies
DROP POLICY IF EXISTS "Authenticated users can manage interactions" ON public.customer_interactions;
CREATE POLICY "Authenticated users can manage interactions" ON public.customer_interactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON public.reviews;

CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR auth.uid() IS NOT NULL);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id));
CREATE POLICY "Authenticated users can manage reviews" ON public.reviews FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- GRANTS
-- ============================================
GRANT ALL ON public.customers TO authenticated;
GRANT SELECT ON public.customers TO anon;
GRANT ALL ON public.pilots TO authenticated;
GRANT SELECT ON public.pilots TO anon;
GRANT ALL ON public.tour_packages TO authenticated;
GRANT SELECT ON public.tour_packages TO anon;
GRANT ALL ON public.communications TO authenticated;
GRANT ALL ON public.customer_interactions TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
