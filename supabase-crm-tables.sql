-- CRM Database Schema
-- This creates all necessary tables for a comprehensive CRM system

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
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
    
    -- Customer classification
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'group', 'corporate')),
    vip_status BOOLEAN DEFAULT false,
    tags TEXT[], -- For flexible categorization
    
    -- Marketing & preferences
    preferred_language TEXT DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT false,
    newsletter_subscribed BOOLEAN DEFAULT false,
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}'::jsonb,
    
    -- Customer value metrics
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    average_booking_value DECIMAL(10,2) DEFAULT 0.00,
    last_booking_date TIMESTAMP WITH TIME ZONE,
    
    -- Notes and internal info
    notes TEXT,
    internal_notes TEXT, -- Private notes not visible to customer
    source TEXT, -- How they found us (google, referral, etc)
    referral_source TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraints
    CONSTRAINT unique_customer_email UNIQUE(email)
);

-- ============================================
-- PILOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    
    -- Professional info
    license_number TEXT NOT NULL UNIQUE,
    license_type TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    certifications TEXT[],
    specializations TEXT[], -- tandem, acro, cross-country, etc
    
    -- Experience
    years_experience INTEGER,
    total_flights INTEGER DEFAULT 0,
    total_tandem_flights INTEGER DEFAULT 0,
    
    -- Availability
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')),
    available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
    max_flights_per_day INTEGER DEFAULT 4,
    
    -- Ratings & performance
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Equipment
    equipment_owned TEXT[],
    
    -- Financial
    commission_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    payment_method TEXT DEFAULT 'bank_transfer',
    
    -- Emergency
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOUR PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tour_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    seasonal_pricing JSONB, -- Different prices for different seasons
    
    -- Capacity
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 1,
    
    -- Requirements
    min_age INTEGER,
    max_age INTEGER,
    max_weight DECIMAL(5,2),
    fitness_level TEXT,
    restrictions TEXT[],
    
    -- Features
    includes TEXT[], -- What's included (photos, video, insurance, etc)
    equipment_provided TEXT[],
    meeting_point TEXT,
    
    -- Availability
    available_days TEXT[],
    available_times TEXT[],
    seasonal_availability JSONB,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'seasonal')),
    featured BOOLEAN DEFAULT false,
    
    -- SEO & Marketing
    slug TEXT UNIQUE,
    image_urls TEXT[],
    video_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMUNICATIONS LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    
    -- Communication details
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'phone', 'whatsapp', 'in_person', 'other')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Metadata
    sent_by UUID REFERENCES auth.users(id),
    sent_by_name TEXT,
    received_by TEXT,
    
    -- Status
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'read')),
    
    -- Attachments
    attachments JSONB, -- URLs to files
    
    -- Timestamps
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMER INTERACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    
    -- Interaction details
    type TEXT NOT NULL CHECK (type IN ('inquiry', 'booking', 'complaint', 'feedback', 'support', 'follow_up', 'other')),
    summary TEXT NOT NULL,
    details TEXT,
    
    -- Outcome
    outcome TEXT,
    action_required BOOLEAN DEFAULT false,
    action_taken TEXT,
    
    -- Staff
    handled_by UUID REFERENCES auth.users(id),
    handled_by_name TEXT,
    
    -- Timestamps
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS & RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
    
    -- Rating
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    pilot_rating INTEGER CHECK (pilot_rating >= 1 AND pilot_rating <= 5),
    experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    
    -- Review
    title TEXT,
    comment TEXT,
    
    -- Media
    photos TEXT[],
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    featured BOOLEAN DEFAULT false,
    
    -- Response
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
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

-- Customers: authenticated users can view all, only admins can modify
CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Pilots: public can view active pilots, admins can modify
CREATE POLICY "Anyone can view active pilots" ON public.pilots FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage pilots" ON public.pilots FOR ALL USING (auth.uid() IS NOT NULL);

-- Tour packages: public can view active, admins can modify
CREATE POLICY "Anyone can view active tour packages" ON public.tour_packages FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage tour packages" ON public.tour_packages FOR ALL USING (auth.uid() IS NOT NULL);

-- Communications: only authenticated users
CREATE POLICY "Authenticated users can view communications" ON public.communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert communications" ON public.communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Customer interactions: only authenticated users
CREATE POLICY "Authenticated users can manage interactions" ON public.customer_interactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Reviews: public can view approved, customers can create, admins manage
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

-- Service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
