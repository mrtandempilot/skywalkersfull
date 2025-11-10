# Google Calendar Integration Setup Guide

This guide will help you set up Google Calendar integration for your booking system. Bookings will automatically sync to Google Calendar when created, updated, or cancelled.

## Features

✅ Automatic calendar event creation when bookings are made
✅ Event updates when bookings are modified
✅ Event deletion when bookings are cancelled
✅ Email notifications to customers
✅ Availability checking
✅ Timezone support (Europe/Istanbul)

## Prerequisites

- Google Cloud Console account
- Supabase project (already set up)
- Next.js application (already configured)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Name: `calendar-service-account` (or your preferred name)
   - Description: "Service account for calendar integration"
4. Click "Create and Continue"
5. Grant roles (optional for this step, click "Continue")
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" → "Create New Key"
4. Select "JSON" format
5. Click "Create"
6. A JSON file will be downloaded - **keep this safe!**

## Step 4: Share Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com)
2. Go to Settings (gear icon) → Settings
3. In the left sidebar, find your calendar under "Settings for my calendars"
4. Click "Share with specific people or groups"
5. Click "Add people and groups"
6. Enter the service account email (found in the JSON file as `client_email`)
7. Set permission to "Make changes to events"
8. Click "Send"

## Step 5: Configure Environment Variables

Open your `.env.local` file and update the following:

```env
# Google Calendar API
GOOGLE_CALENDAR_ID=primary
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important notes:**
- Get `GOOGLE_SERVICE_ACCOUNT_EMAIL` from the downloaded JSON file (`client_email` field)
- Get `GOOGLE_PRIVATE_KEY` from the downloaded JSON file (`private_key` field)
- Keep the quotes around the private key
- Ensure newline characters (`\n`) are preserved in the private key

### Alternative: Using Specific Calendar

If you want to use a specific calendar instead of the primary one:

1. In Google Calendar, go to the calendar's settings
2. Scroll down to "Integrate calendar"
3. Copy the "Calendar ID"
4. Replace `primary` with this Calendar ID in your `.env.local`:

```env
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

## Step 6: Set Up Supabase Database

Run the SQL script to create the bookings table:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of `supabase-bookings-table.sql`
5. Paste and run the SQL script

This will create:
- `bookings` table with all necessary fields
- Indexes for performance
- Row Level Security policies
- Automatic timestamp updates

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/bookings` in your browser

3. Create a test booking:
   - Fill in the booking form
   - Submit the booking
   - Check your Google Calendar - the event should appear!

4. Try cancelling the booking:
   - Go to "My Bookings" tab
   - Cancel the test booking
   - The event should be removed from Google Calendar

## Troubleshooting

### Error: "Failed to create calendar event"

**Solution:**
- Verify the service account email is correctly shared with your calendar
- Check that the private key is correctly formatted in `.env.local`
- Ensure Google Calendar API is enabled in Google Cloud Console

### Error: "User not authenticated"

**Solution:**
- Make sure you're logged in
- Check Supabase authentication is working
- Verify the auth token is valid

### Events not appearing in calendar

**Solution:**
- Check the calendar ID in `.env.local` is correct
- Verify the service account has "Make changes to events" permission
- Look for errors in the browser console or server logs

### Private key format issues

**Solution:**
The private key should be a single line with `\n` for newlines:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

## How It Works

### Booking Creation Flow
1. User creates a booking via the form
2. Booking is saved to Supabase database
3. Google Calendar event is created automatically
4. Event ID is stored in the booking record
5. Email notification is sent to the customer

### Booking Update Flow
1. User updates a booking
2. Booking record is updated in Supabase
3. Google Calendar event is updated automatically
4. Attendees are notified of changes

### Booking Cancellation Flow
1. User cancels a booking
2. Booking status is changed to "cancelled" in Supabase
3. Google Calendar event is deleted
4. Cancellation email is sent to the customer

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Keep service account credentials secure

2. **Use Row Level Security in Supabase**
   - Already configured in the SQL script
   - Users can only access their own bookings

3. **Validate all input**
   - Client-side and server-side validation
   - Prevent unauthorized access

## Additional Features

### Checking Availability
The system includes an availability checker:

```typescript
import { checkAvailability } from '@/lib/google-calendar';

const isAvailable = await checkAvailability('2024-01-15', '10:00', 120);
```

### Getting Bookings by Date Range
```typescript
import { getBookingsByDateRange } from '@/lib/bookings';

const bookings = await getBookingsByDateRange('2024-01-01', '2024-01-31');
```

## Navigation Link

Add a link to the bookings page in your navbar:

```tsx
<Link href="/bookings">Bookings</Link>
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review server logs
3. Verify all environment variables are set correctly
4. Ensure the service account has proper permissions

## Next Steps

- Configure email templates in Supabase
- Set up webhook for real-time calendar sync
- Add admin dashboard for managing all bookings
- Implement payment integration
- Add SMS notifications

---

🎉 Your Google Calendar integration is now set up! Bookings will automatically sync to your calendar.
