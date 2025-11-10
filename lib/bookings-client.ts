import { Booking, CreateBookingInput } from '@/types/booking';
import { supabase } from './supabase';

// Get auth token for API calls
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

// Create a new booking via API
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create booking');
  }
}

// Get all bookings for current user via API
export async function getUserBookings(): Promise<Booking[]> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bookings');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bookings');
  }
}

// Cancel booking via API
export async function cancelBooking(id: string): Promise<void> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel booking');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to cancel booking');
  }
}
