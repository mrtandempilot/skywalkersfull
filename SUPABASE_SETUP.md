# Supabase Setup Guide for Oludeniz Tours

This guide will help you set up Supabase for your Oludeniz Tours application.

## 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## 2. Database Setup

### Create Tours Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create tours table
create table tours (
  id bigserial primary key,
  name text not null,
  price text not null,
  duration text not null,
  description text not null,
  includes text[] not null default '{}',
  color text not null default 'blue',
  image_url text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table tours enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
  on tours for select
  using (true);

-- Create policy to allow authenticated users to insert/update
create policy "Allow authenticated insert/update"
  on tours for all
  using (auth.role() = 'authenticated');
```

### Insert Sample Data

```sql
insert into tours (name, price, duration, description, includes, color, featured) values
('Tandem Paragliding', '€75', '30-45 minutes', 'Experience the ultimate thrill of flying above the stunning Blue Lagoon with our tandem paragliding adventure. Accompanied by experienced, certified pilots, you will soar high above Oludeniz and enjoy breathtaking panoramic views of the coastline.', 
ARRAY['Professional pilot', 'Safety equipment', 'Photos and videos', 'Hotel pickup and drop-off', 'Insurance'], 
'blue', true),

('Boat Tour', '€45', 'Full day', 'Discover the hidden gems of the Turquoise Coast on our full-day boat tour. Visit secluded bays, swim in crystal-clear waters, and explore the stunning Butterfly Valley. Includes a delicious lunch on board.',
ARRAY['Lunch and refreshments', 'Swimming stops', 'Butterfly Valley visit', 'Snorkeling equipment', 'Experienced crew'],
'green', true),

('Jeep Safari', '€50', '6-7 hours', 'Embark on an exciting off-road adventure through the Taurus Mountains. Visit traditional villages, explore ancient ruins, and enjoy spectacular mountain views. Perfect for those seeking adventure and culture.',
ARRAY['4x4 jeep ride', 'Village visits', 'Lunch in local restaurant', 'Swimming break', 'Professional guide'],
'orange', true),

('Scuba Diving', '€60', 'Half day', 'Dive into the crystal-clear Mediterranean waters and explore vibrant marine life. Suitable for both beginners and experienced divers. All equipment and instruction provided.',
ARRAY['Diving equipment', 'PADI certified instructor', '2 dives', 'Light refreshments', 'Underwater photos'],
'cyan', false),

('Sunset Cruise', '€40', '3 hours', 'Enjoy a romantic evening sailing along the coast as the sun sets over the Mediterranean. Includes drinks and snacks while you relax and take in the spectacular views.',
ARRAY['Drinks and snacks', 'Swimming opportunity', 'Music on board', 'Sunset views', 'Professional crew'],
'purple', false),

('Kayaking Adventure', '€35', '4 hours', 'Paddle through the beautiful turquoise waters and explore hidden coves and beaches. Suitable for all skill levels with a guide to lead the way.',
ARRAY['Kayak and equipment', 'Safety gear', 'Professional guide', 'Snorkeling opportunity', 'Waterproof bag'],
'teal', false);
```

## 3. Storage Setup (for Images)

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `tour-images`
3. Make the bucket public:
   - Click on the bucket
   - Go to Policies
   - Add a new policy for SELECT operations with `true` as the policy expression
4. Upload tour images to this bucket

### Image URL Format

Once uploaded, your image URLs will be:
```
https://[your-project-id].supabase.co/storage/v1/object/public/tour-images/[image-name.jpg]
```

Update tour records with image URLs:
```sql
update tours set image_url = 'https://[your-project-id].supabase.co/storage/v1/object/public/tour-images/paragliding.jpg' where name = 'Tandem Paragliding';
```

## 4. Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

## 5. Configure Environment Variables

### Local Development

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Redeploy your application

## 6. Database Schema Reference

### Tours Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| name | text | Tour name |
| price | text | Price (e.g., "€75") |
| duration | text | Duration (e.g., "30-45 minutes") |
| description | text | Tour description |
| includes | text[] | Array of included items |
| color | text | Color theme (blue, green, orange, cyan, purple, teal) |
| image_url | text | URL to tour image |
| featured | boolean | Show on homepage |
| created_at | timestamp | Creation timestamp |

## 7. Testing

After setup:

1. Start your development server: `npm run dev`
2. Visit http://localhost:3000/tours
3. You should see tours loaded from Supabase
4. Homepage should show featured tours

## Troubleshooting

**Tours not loading:**
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Row Level Security policies are configured
- Check Supabase project is active

**Images not displaying:**
- Verify image URLs are correct
- Check storage bucket is public
- Ensure images are uploaded to Supabase Storage
- Verify next.config.mjs has correct image configuration

## Support

For issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Image Documentation](https://nextjs.org/docs/api-reference/next/image)
