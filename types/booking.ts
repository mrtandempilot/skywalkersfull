export interface Booking {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_name: string;
  booking_date: string;
  tour_start_time: string;
  adults: number;
  children: number;
  duration?: number;
  channel?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount?: number;
  google_calendar_event_id?: string;
  notes?: string;
  hotel_name?: string;
  created_at: string;
  updated_at?: string;
  
  // Computed fields for compatibility
  user_name?: string;
  user_email?: string;
  participants?: number;
  total_price?: number;
}

export interface CreateBookingInput {
  tour_name: string;
  booking_date: string;
  tour_start_time: string;
  adults: number;
  children?: number;
  duration?: number;
  total_amount?: number;
  notes?: string;
  hotel_name?: string;
}
