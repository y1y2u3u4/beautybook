# Testing Guide for BeautyBook

## Test Accounts

The following test accounts have been created for development and testing:

### Customer Account
- **Email:** `customer@test.com`
- **Role:** Customer
- **Use for:** Booking appointments, browsing providers

### Provider Accounts

#### Provider 1: Radiant Skin Clinic
- **Email:** `provider1@test.com`
- **Name:** Sarah Johnson
- **Business:** Radiant Skin Clinic
- **Specialties:** Facial Treatments, Skin Care, Anti-Aging
- **Services:**
  - Hydrating Facial ($150, 60 min)
  - Anti-Aging Treatment ($300, 90 min)
  - Chemical Peel ($250, 45 min)

#### Provider 2: Hair Studio
- **Email:** `provider2@test.com`
- **Name:** Emily Rodriguez
- **Business:** Emily Rodriguez Hair Studio
- **Specialties:** Hair Styling, Color, Balayage
- **Services:**
  - Haircut & Style ($100, 60 min)
  - Full Color & Highlights ($350, 180 min)
  - Balayage ($300, 150 min)

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

**Required for basic functionality:**
- `DATABASE_URL` - PostgreSQL database connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key

**Optional (for full features):**
- Stripe keys for payments
- SendGrid for emails
- Twilio for SMS
- Google OAuth for calendar integration

### 2. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed test data
npm run seed
```

### 3. Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Testing Workflows

### As a Customer

1. Visit the homepage
2. Click "Find Providers" or browse services
3. Select a provider
4. View their profile, services, and availability
5. Book an appointment (requires Clerk sign-in)

### As a Provider

1. Visit `/register` to see the provider registration page
2. Use one of the test provider accounts to log in (via Clerk)
3. Access provider dashboard (when implemented)
4. Manage services, availability, and bookings

### Testing Registration Flow

The `/register` page shows:
- Benefits of joining BeautyBook
- Test account information
- Coming soon notice (full registration not yet implemented)

## Development Notes

### Current Status

✅ **Implemented:**
- Provider browsing and search
- Provider profile pages
- Service listings
- Basic booking UI
- Database schema with Prisma
- Test data seeding

🚧 **In Progress:**
- Provider registration flow
- Appointment booking functionality
- Payment integration
- Email/SMS notifications

### Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:
- `User` - Base user model (synced with Clerk)
- `CustomerProfile` - Customer-specific data
- `ProviderProfile` - Provider business information
- `Service` - Services offered by providers
- `Appointment` - Booking records
- `Review` - Customer reviews
- `Availability` - Provider working hours

## Troubleshooting

### Database Connection Issues

If you see database errors, ensure:
1. PostgreSQL is running
2. `DATABASE_URL` in `.env.local` is correct
3. Run `npm run prisma:push` to sync the schema

### Clerk Authentication Issues

If authentication doesn't work:
1. Check Clerk dashboard settings
2. Verify environment variables
3. Ensure redirect URLs are configured in Clerk

### Build Errors

If the build fails:
```bash
# Clean and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## Support

For issues or questions, please:
- Check the main README.md
- Review Prisma schema in `/prisma/schema.prisma`
- Check API routes in `/app/api`
