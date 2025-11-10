export interface Customer {
  id: string;
  user_id?: string;
  name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  passport_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Customer classification
  customer_type: 'individual' | 'group' | 'corporate';
  vip_status: boolean;
  tags?: string[];
  
  // Marketing & preferences
  preferred_language: string;
  marketing_consent: boolean;
  newsletter_subscribed: boolean;
  communication_preferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  
  // Customer value metrics
  total_bookings: number;
  total_spent: number;
  lifetime_value: number;
  average_booking_value: number;
  last_booking_date?: string;
  
  // Notes
  notes?: string;
  internal_notes?: string;
  source?: string;
  referral_source?: string;
  
  // Status
  status: 'active' | 'inactive' | 'blacklisted';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Pilot {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Professional info
  license_number: string;
  license_type: string;
  license_expiry: string;
  certifications?: string[];
  specializations?: string[];
  
  // Experience
  years_experience?: number;
  total_flights: number;
  total_tandem_flights: number;
  
  // Availability
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  available_days: string[];
  max_flights_per_day: number;
  
  // Ratings
  average_rating: number;
  total_reviews: number;
  
  // Equipment
  equipment_owned?: string[];
  
  // Financial
  commission_rate: number;
  payment_method: string;
  
  // Emergency
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TourPackage {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  
  // Pricing
  base_price: number;
  currency: string;
  seasonal_pricing?: any;
  
  // Capacity
  min_participants: number;
  max_participants: number;
  
  // Requirements
  min_age?: number;
  max_age?: number;
  max_weight?: number;
  fitness_level?: string;
  restrictions?: string[];
  
  // Features
  includes?: string[];
  equipment_provided?: string[];
  meeting_point?: string;
  
  // Availability
  available_days?: string[];
  available_times?: string[];
  seasonal_availability?: any;
  
  // Status
  status: 'active' | 'inactive' | 'seasonal';
  featured: boolean;
  
  // SEO
  slug?: string;
  image_urls?: string[];
  video_url?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  customer_id: string;
  booking_id?: string;
  
  type: 'email' | 'sms' | 'phone' | 'whatsapp' | 'in_person' | 'other';
  direction: 'inbound' | 'outbound';
  subject?: string;
  message: string;
  
  sent_by?: string;
  sent_by_name?: string;
  received_by?: string;
  
  status: 'draft' | 'sent' | 'delivered' | 'failed' | 'read';
  
  attachments?: any;
  
  scheduled_at?: string;
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  
  type: 'inquiry' | 'booking' | 'complaint' | 'feedback' | 'support' | 'follow_up' | 'other';
  summary: string;
  details?: string;
  
  outcome?: string;
  action_required: boolean;
  action_taken?: string;
  
  handled_by?: string;
  handled_by_name?: string;
  
  interaction_date: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  pilot_id?: string;
  
  overall_rating: number;
  pilot_rating?: number;
  experience_rating?: number;
  value_rating?: number;
  
  title?: string;
  comment?: string;
  photos?: string[];
  
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  featured: boolean;
  
  response?: string;
  responded_at?: string;
  responded_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  
  todayBookings: number;
  todayRevenue: number;
  
  weekBookings: number;
  weekRevenue: number;
  
  monthBookings: number;
  monthRevenue: number;
  
  activeCustomers: number;
  vipCustomers: number;
  
  activePilots: number;
  totalFlights: number;
  
  pendingReviews: number;
  averageRating: number;
  
  revenueGrowth: number;
  bookingGrowth: number;
  customerGrowth: number;
}

export interface BookingPipeline {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
