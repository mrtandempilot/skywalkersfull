# Authentication Guide

## Where User Data is Stored

When users sign up through the login page at `/login`, their data is automatically saved in **Supabase Authentication**.

### Supabase Dashboard Access

1. **Dashboard URL**: https://app.supabase.com
2. **Project URL**: https://wpprlxuqvrinqefybatt.supabase.co

### Viewing Users

To view registered users:
1. Go to your Supabase Dashboard
2. Select your project
3. Click **"Authentication"** in the left sidebar
4. Click **"Users"** tab
5. You'll see all registered users with their:
   - Email addresses
   - User IDs
   - Sign-up dates
   - Last sign-in times
   - Email confirmation status

### User Data Structure

Each user in Supabase has:
- `id`: Unique user identifier (UUID)
- `email`: User's email address
- `created_at`: When the account was created
- `last_sign_in_at`: Last login time
- `email_confirmed_at`: When email was verified
- And other metadata

## How the Authentication Works

### Sign Up Flow
1. User enters email and password on `/login` page
2. The `signUp()` function in `lib/auth.ts` sends data to Supabase
3. Supabase creates a new user in the `auth.users` table
4. Supabase sends a confirmation email (if email confirmation is enabled)
5. User data is saved automatically

### Sign In Flow
1. User enters credentials on `/login` page
2. The `signIn()` function validates credentials with Supabase
3. If valid, Supabase creates a session
4. User is redirected to the home page
5. Navbar shows user's email and "Sign Out" button

### Sign Out Flow
1. User clicks "Sign Out" button in Navbar
2. The `signOut()` function clears the session
3. User is redirected to home page
4. Navbar shows "Login" button again

## Testing the Authentication

### To Test Sign Up:
1. Visit http://localhost:3000/login
2. Click "Sign Up" toggle
3. Enter email and password
4. Click "Sign Up" button
5. Check your Supabase Dashboard to see the new user

### To Test Sign In:
1. Visit http://localhost:3000/login
2. Enter your registered email and password
3. Click "Sign In" button
4. You'll be redirected to home page
5. Your email will appear in the Navbar

## Important Notes

- **Password Security**: Passwords are automatically hashed and encrypted by Supabase
- **Email Verification**: By default, Supabase may require email verification. Check your Supabase project settings under Authentication > Email to configure this
- **Session Management**: Sessions are handled automatically by Supabase and persist across page reloads
- **Database**: User authentication data is separate from your application data tables

## Supabase Configuration

Your current Supabase configuration is in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://wpprlxuqvrinqefybatt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

These credentials connect your app to your Supabase project where users are stored.
