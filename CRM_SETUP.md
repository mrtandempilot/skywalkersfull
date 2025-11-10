# CRM System Setup Guide

This guide will help you set up and use the comprehensive CRM (Customer Relationship Management) system for your paragliding business.

## Overview

The CRM system includes:
- **Dashboard** - Analytics and business overview
- **Customer Management** - Track customer information and history
- **Pilot Management** - Manage pilot profiles and schedules
- **Booking Pipeline** - Visualize and manage bookings
- **Communications Tracking** - Log all customer interactions
- **Review Management** - Handle customer reviews and ratings
- **Analytics & Reporting** - Business insights and metrics

## Database Setup

### Step 1: Run the SQL Migration

Execute the CRM database schema in your Supabase SQL editor:

```bash
# The schema file is located at:
supabase-crm-tables.sql
```

This will create the following tables:
- `customers` - Customer profiles and information
- `pilots` - Pilot profiles and availability
- `tour_packages` - Tour package details and pricing
- `communications` - Communication logs
- `customer_interactions` - Customer interaction history
- `reviews` - Customer reviews and ratings

### Step 2: Verify Tables

After running the migration, verify the tables were created:

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Confirm all 6 new tables exist

## Features

### 1. Dashboard (`/dashboard`)

The main dashboard provides:

**Key Metrics:**
- Total Revenue with growth percentage
- Total Bookings with growth percentage
- Total Customers with growth percentage
- Average Rating

**Time Period Stats:**
- Today's bookings and revenue
- This week's bookings and revenue
- This month's bookings and revenue

**Booking Pipeline:**
- Pending bookings
- Confirmed bookings
- Completed bookings
- Cancelled bookings

**Quick Stats:**
- Active customers
- VIP customers
- Active pilots
- Total flights
- Average booking value

**Quick Actions:**
- Create new customer
- Create new booking
- Manage pilots
- View analytics

### 2. Customer Management

**Customer Profile Includes:**
- Personal information (name, email, phone, address)
- Classification (individual, group, corporate)
- VIP status
- Tags for categorization
- Marketing preferences
- Customer value metrics (lifetime value, total bookings, etc.)
- Source tracking (how they found you)
- Notes and internal notes

**Customer Metrics:**
- Total bookings
- Total spent
- Lifetime value
- Average booking value
- Last booking date

### 3. Pilot Management

**Pilot Profile Includes:**
- Personal and professional information
- License details (number, type, expiry)
- Certifications and specializations
- Experience metrics
- Availability settings
- Rating and reviews
- Equipment owned
- Commission rate
- Emergency contact

### 4. Tour Packages

**Package Details:**
- Name and description
- Duration
- Pricing (base price, seasonal pricing)
- Capacity (min/max participants)
- Requirements (age, weight, fitness level)
- Features and inclusions
- Availability schedule
- Media (images, videos)

### 5. Communications Tracking

**Track All Communications:**
- Type (email, SMS, phone, WhatsApp, in-person)
- Direction (inbound/outbound)
- Message content
- Status (sent, delivered, read)
- Attachments
- Related customer and booking

### 6. Customer Interactions

**Interaction Types:**
- Inquiry
- Booking
- Complaint
- Feedback
- Support
- Follow-up
- Other

**Track:**
- Summary and details
- Outcome
- Actions required/taken
- Staff member who handled it
- Follow-up dates

### 7. Reviews & Ratings

**Review System:**
- Overall rating (1-5 stars)
- Pilot rating
- Experience rating
- Value rating
- Title and comment
- Photos
- Status (pending, approved, rejected, hidden)
- Staff response capability

## Accessing the CRM

### For Authenticated Users

1. **Login** to your account at `/login`
2. **Navigate** to Dashboard via the navbar link
3. The dashboard link only appears for authenticated users

### Navigation

- **Desktop**: Dashboard link appears in the main navigation bar
- **Mobile**: Dashboard link appears in the mobile menu dropdown

## API Functions

The CRM provides the following library functions in `lib/crm.ts`:

### Customers
```typescript
getCustomers()
getCustomerById(id)
createCustomer(customer)
updateCustomer(id, updates)
deleteCustomer(id)
searchCustomers(query)
```

### Pilots
```typescript
getPilots()
getActivePilots()
getPilotById(id)
createPilot(pilot)
updatePilot(id, updates)
```

### Tour Packages
```typescript
getTourPackages()
getActiveTourPackages()
createTourPackage(tourPackage)
updateTourPackage(id, updates)
```

### Communications
```typescript
getCommunicationsByCustomer(customerId)
createCommunication(communication)
```

### Customer Interactions
```typescript
getInteractionsByCustomer(customerId)
createInteraction(interaction)
updateInteraction(id, updates)
```

### Reviews
```typescript
getReviews()
getPendingReviews()
updateReview(id, updates)
```

### Analytics
```typescript
getDashboardStats()
getBookingPipeline()
```

## TypeScript Types

All CRM entities have TypeScript interfaces defined in `types/crm.ts`:

- `Customer`
- `Pilot`
- `TourPackage`
- `Communication`
- `CustomerInteraction`
- `Review`
- `DashboardStats`
- `BookingPipeline`

## Security & Permissions

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

**Customers:**
- Anyone can view customers
- Authenticated users can insert/update

**Pilots:**
- Anyone can view active pilots
- Authenticated users can manage all

**Tour Packages:**
- Anyone can view active packages
- Authenticated users can manage all

**Communications:**
- Only authenticated users can access

**Customer Interactions:**
- Only authenticated users can access

**Reviews:**
- Anyone can view approved reviews
- Customers can create reviews for their bookings
- Authenticated users can manage reviews

## Best Practices

### 1. Customer Management
- Always fill in customer email and phone for communication
- Use tags to categorize customers (e.g., "repeat", "referral", "VIP")
- Update customer notes after each interaction
- Keep internal notes separate for staff-only information

### 2. Pilot Management
- Keep license information up to date
- Monitor license expiry dates
- Track pilot ratings and reviews
- Update availability regularly

### 3. Communication Tracking
- Log all customer communications
- Use consistent types for easy filtering
- Include relevant booking references
- Attach important files when applicable

### 4. Review Management
- Respond to all reviews (positive and negative)
- Feature excellent reviews on your website
- Use review feedback for business improvements
- Address negative reviews professionally

### 5. Analytics
- Check dashboard daily for business overview
- Monitor growth percentages
- Track booking pipeline for capacity planning
- Use customer metrics for targeted marketing

## Next Steps

### Planned Features (Not Yet Implemented)

The following pages need to be created:

1. **Customer List & Detail Pages**
   - `/dashboard/customers` - List all customers
   - `/dashboard/customers/[id]` - Customer detail page

2. **Pilot Management Pages**
   - `/dashboard/pilots` - List all pilots
   - `/dashboard/pilots/[id]` - Pilot detail page

3. **Analytics Page**
   - `/dashboard/analytics` - Detailed reports and charts

4. **Tour Package Management**
   - `/dashboard/packages` - Manage tour packages

5. **Review Management**
   - `/dashboard/reviews` - Manage customer reviews

### Creating Additional Pages

Use the dashboard page as a template for creating additional CRM pages. Each page should:
- Check for authentication
- Fetch necessary data server-side
- Display data in a clean, organized layout
- Include action buttons for create/edit/delete operations

## Troubleshooting

### Tables Not Found
- Ensure you've run the SQL migration in Supabase
- Check Supabase Table Editor to verify tables exist

### Permission Errors
- Verify RLS policies are set up correctly
- Ensure user is authenticated
- Check if using correct API keys in `.env.local`

### Data Not Showing
- Verify tables have data (may need to seed initial data)
- Check browser console for errors
- Ensure Supabase connection is working

## Support

For issues or questions:
- Check the Supabase documentation
- Review the code comments in `lib/crm.ts`
- Check TypeScript interfaces in `types/crm.ts`

## Summary

You now have a fully functional CRM system with:
- ✅ Database schema created
- ✅ TypeScript types defined
- ✅ API functions implemented
- ✅ Dashboard page created
- ✅ Navigation updated
- ✅ Analytics and metrics
- ✅ Security policies in place

The foundation is complete. You can now build out the additional customer management, pilot management, and analytics pages as needed for your business.
