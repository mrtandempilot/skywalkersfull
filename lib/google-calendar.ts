import { google } from 'googleapis';
import { Booking } from '@/types/booking';
import { supabase } from './supabase';

// Get tour image URL from Supabase
async function getTourImageUrl(tourName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('image_url')
      .eq('name', tourName)
      .single();

    if (error || !data) {
      console.log(`No image found for tour: ${tourName}`);
      return null;
    }

    return data.image_url;
  } catch (error) {
    console.error('Error fetching tour image:', error);
    return null;
  }
}

// Initialize Google Calendar API
function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// Create a calendar event from a booking
export async function createCalendarEvent(booking: Booking): Promise<string | null> {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Get tour image from Supabase
    const tourImageUrl = await getTourImageUrl(booking.tour_name);

    // Parse date and time
    const [year, month, day] = booking.booking_date.split('-').map(Number);
    const [hours, minutes] = booking.tour_start_time.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + (booking.duration || 120) * 60000);

    const participants = booking.adults + (booking.children || 0);
    const event: any = {
      summary: `${booking.tour_name} - ${booking.customer_name}`,
      description: `
Booking Details:
- Customer: ${booking.customer_name}
- Email: ${booking.customer_email}
${booking.customer_phone ? `- Phone: ${booking.customer_phone}` : ''}
- Tour: ${booking.tour_name}
- Adults: ${booking.adults}
${booking.children ? `- Children: ${booking.children}` : ''}
- Total Participants: ${participants}
${booking.total_amount ? `- Price: $${booking.total_amount}` : ''}
${booking.hotel_name ? `- Hotel: ${booking.hotel_name}` : ''}
- Status: ${booking.status}
${booking.notes ? `- Notes: ${booking.notes}` : ''}

Booking ID: ${booking.id}
      `.trim(),
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    // Add image attachment if available
    if (tourImageUrl) {
      event.attachments = [
        {
          fileUrl: tourImageUrl,
          title: `${booking.tour_name} - Tour Image`,
          mimeType: 'image/jpeg',
        },
      ];
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data.id || null;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Failed to create calendar event');
  }
}

// Update a calendar event
export async function updateCalendarEvent(
  eventId: string,
  booking: Booking
): Promise<void> {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Get tour image from Supabase
    const tourImageUrl = await getTourImageUrl(booking.tour_name);

    const [year, month, day] = booking.booking_date.split('-').map(Number);
    const [hours, minutes] = booking.tour_start_time.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + (booking.duration || 120) * 60000);

    const participants = booking.adults + (booking.children || 0);
    const event: any = {
      summary: `${booking.tour_name} - ${booking.customer_name}`,
      description: `
Booking Details:
- Customer: ${booking.customer_name}
- Email: ${booking.customer_email}
${booking.customer_phone ? `- Phone: ${booking.customer_phone}` : ''}
- Tour: ${booking.tour_name}
- Adults: ${booking.adults}
${booking.children ? `- Children: ${booking.children}` : ''}
- Total Participants: ${participants}
${booking.total_amount ? `- Price: $${booking.total_amount}` : ''}
${booking.hotel_name ? `- Hotel: ${booking.hotel_name}` : ''}
- Status: ${booking.status}
${booking.notes ? `- Notes: ${booking.notes}` : ''}

Booking ID: ${booking.id}
      `.trim(),
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Istanbul',
      },
    };

    // Add image attachment if available
    if (tourImageUrl) {
      event.attachments = [
        {
          fileUrl: tourImageUrl,
          title: `${booking.tour_name} - Tour Image`,
          mimeType: 'image/jpeg',
        },
      ];
    }

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error('Failed to update calendar event');
  }
}

// Delete a calendar event
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error('Failed to delete calendar event');
  }
}

// Check calendar availability for a specific date/time
export async function checkAvailability(
  date: string,
  time: string,
  duration: number
): Promise<boolean> {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
    });

    // If no events found, the time slot is available
    return !response.data.items || response.data.items.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}
