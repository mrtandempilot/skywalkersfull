import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createCalendarEvent } from '@/lib/google-calendar';
import { CreateBookingInput } from '@/types/booking';

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingInput = await request.json();
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-create or update customer record
    const customerEmail = user.email || '';
    const customerName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest';
    const customerPhone = user.user_metadata?.phone || user.phone || '';
    
    // Parse name into first and last name
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Check if customer exists (using admin client to bypass RLS)
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', customerEmail)
      .single();

    let customerId;

    if (!existingCustomer) {
      // Create new customer (using admin client to bypass RLS)
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          user_id: user.id,
          name: customerName,  // Required field
          first_name: firstName,
          last_name: lastName,
          email: customerEmail,
          phone: customerPhone,
          status: 'active',
          customer_type: 'individual',
          vip_status: false,
          total_bookings: 1,
          total_spent: body.total_amount,
          lifetime_value: body.total_amount,
          average_booking_value: body.total_amount,
          source: 'online_booking',
          last_booking_date: new Date().toISOString(),
          notes: `Auto-created from booking on ${new Date().toLocaleDateString()}`
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
        // Don't fail the booking if customer creation fails
      } else {
        customerId = newCustomer?.id;
        console.log('✅ New customer created:', customerEmail);
      }
    } else {
      customerId = existingCustomer.id;
      
      // Update existing customer's last booking date (using admin client)
      await supabaseAdmin
        .from('customers')
        .update({
          last_booking_date: new Date().toISOString(),
          phone: customerPhone || existingCustomer.phone  // Update phone if provided
        })
        .eq('id', customerId);
      
      console.log('✅ Existing customer found:', customerEmail);
    }

    // Create booking in Supabase
    const bookingData = {
      user_id: user.id,
      customer_email: user.email || '',
      customer_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Guest',
      tour_name: body.tour_name,
      booking_date: body.booking_date,
      tour_start_time: body.tour_start_time,
      adults: body.adults || 1,
      children: body.children || 0,
      duration: body.duration || 120,
      total_amount: body.total_amount,
      hotel_name: body.hotel_name,
      notes: body.notes,
      channel: 'website',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const booking = data;

    // Update customer statistics
    if (customerId) {
      try {
        // Get all completed bookings for this customer
        const { data: completedBookings } = await supabase
          .from('bookings')
          .select('price')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        const totalSpent = completedBookings?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;
        const totalBookings = completedBookings?.length || 0;

        // Get all bookings (any status) for count
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('user_id', user.id);

        await supabaseAdmin
          .from('customers')
          .update({
            total_bookings: allBookings?.length || 0,
            total_spent: totalSpent,
            lifetime_value: totalSpent,
            average_booking_value: totalBookings > 0 ? totalSpent / totalBookings : 0,
            last_booking_date: new Date().toISOString()
          })
          .eq('id', customerId);
      } catch (updateError) {
        console.error('Error updating customer stats:', updateError);
      }
    }

    // Create Google Calendar event
    try {
      const eventId = await createCalendarEvent(booking);
      
      if (eventId) {
        // Update booking with calendar event ID
        await supabase
          .from('bookings')
          .update({ google_calendar_event_id: eventId })
          .eq('id', booking.id);

        booking.google_calendar_event_id = eventId;
      }
    } catch (calendarError) {
      console.error('Failed to create calendar event:', calendarError);
      // Continue even if calendar creation fails
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
