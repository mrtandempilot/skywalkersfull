import { supabase } from './supabase';
import { Booking, CreateBookingInput } from '@/types/booking';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './google-calendar';
import { getCurrentUser } from './auth';

// Create a new booking and sync to Google Calendar
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create booking in Supabase
    const bookingData = {
      user_id: user.id,
      user_email: user.email || '',
      user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Guest',
      ...input,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const booking = data as Booking;

    // Create Google Calendar event
    try {
      const eventId = await createCalendarEvent(booking);
      
      if (eventId) {
        // Update booking with calendar event ID
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', booking.id);

        if (!updateError) {
          booking.google_calendar_event_id = eventId;
        }
      }
    } catch (calendarError) {
      console.error('Failed to create calendar event:', calendarError);
      // Continue even if calendar creation fails
    }

    return booking;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create booking');
  }
}

// Get all bookings for current user
export async function getUserBookings(): Promise<Booking[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as Booking[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bookings');
  }
}

// Get all bookings (admin only)
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data as Booking[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bookings');
  }
}

// Get a single booking by ID
export async function getBooking(id: string): Promise<Booking> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Booking;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch booking');
  }
}

// Update booking and sync to Google Calendar
export async function updateBooking(
  id: string,
  updates: Partial<CreateBookingInput>
): Promise<Booking> {
  try {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bookings')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const booking = data as Booking;

    // Update Google Calendar event if it exists
    if (booking.google_calendar_event_id) {
      try {
        await updateCalendarEvent(booking.google_calendar_event_id, booking);
      } catch (calendarError) {
        console.error('Failed to update calendar event:', calendarError);
      }
    }

    return booking;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update booking');
  }
}

// Update booking status
export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
): Promise<Booking> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const booking = data as Booking;

    // Update or delete Google Calendar event based on status
    if (booking.google_calendar_event_id) {
      try {
        if (status === 'cancelled') {
          await deleteCalendarEvent(booking.google_calendar_event_id);
        } else {
          await updateCalendarEvent(booking.google_calendar_event_id, booking);
        }
      } catch (calendarError) {
        console.error('Failed to update calendar event:', calendarError);
      }
    }

    return booking;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update booking status');
  }
}

// Cancel booking
export async function cancelBooking(id: string): Promise<void> {
  await updateBookingStatus(id, 'cancelled');
}

// Delete booking (admin only)
export async function deleteBooking(id: string): Promise<void> {
  try {
    // Get booking to get calendar event ID
    const booking = await getBooking(id);

    // Delete from Google Calendar first
    if (booking.google_calendar_event_id) {
      try {
        await deleteCalendarEvent(booking.google_calendar_event_id);
      } catch (calendarError) {
        console.error('Failed to delete calendar event:', calendarError);
      }
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete booking');
  }
}

// Get bookings by date range
export async function getBookingsByDateRange(
  startDate: string,
  endDate: string
): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data as Booking[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch bookings');
  }
}
