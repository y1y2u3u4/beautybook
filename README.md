# BeautyBook - Professional Beauty & Wellness Booking Platform

BeautyBook is a comprehensive appointment management platform designed for the US beauty and wellness market. Inspired by Zocdoc's approach to healthcare provider discovery, BeautyBook brings the same level of transparency, trust, and convenience to the beauty industry.

## Features

### For Customers

- **Advanced Provider Search & Filtering** (Zocdoc-inspired)
  - Search by specialty, location, ratings, and availability
  - Real-time availability display
  - Filter by insurance, price range, distance, and more
  - Sort by rating, reviews, proximity, and next available slot

- **Detailed Provider Profiles**
  - Comprehensive credentials and certifications
  - Education history and professional background
  - Service offerings with transparent pricing
  - Verified customer reviews and ratings
  - Insurance and payment information
  - Real-time availability calendar

- **Seamless Booking Experience**
  - Interactive calendar with real-time availability
  - Service selection with duration and pricing
  - Time slot selection
  - Instant booking confirmation
  - Email and SMS notifications

- **Customer Reviews System**
  - Verified customer reviews
  - Rating distribution analytics
  - Helpful vote system
  - Anonymous feedback option

### For Providers

- **Business Management**
  - Multi-location support
  - Service catalog management
  - Dynamic pricing options
  - Staff and resource scheduling

- **Client Management**
  - Customer profiles with history
  - Medical history tracking
  - Photo upload and AI analysis
  - Custom intake forms

- **Analytics & Reporting**
  - Revenue tracking
  - Appointment analytics
  - Customer retention metrics
  - Staff performance reports

### Platform Features

- **Calendar Integration**
  - Google Calendar sync
  - Outlook integration
  - Automatic conflict prevention
  - Buffer time management

- **Payment Processing**
  - Deposit and full payment options
  - Multiple payment methods
  - POS integration
  - Automated billing

- **Marketing & Notifications**
  - SMS and email reminders
  - Promotional campaigns
  - Loyalty programs
  - Multi-channel booking (web, mobile, social)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js (planned)
- **Payments**: Stripe (planned)
- **Calendar**: Google Calendar API (planned)
- **Notifications**: Twilio (SMS), SendGrid (Email) (planned)

## Design Philosophy

### US Market Focus

- Clean, modern design aligned with American aesthetic preferences
- Accessibility (WCAG 2.1 AA compliant)
- Mobile-first responsive design
- Fast load times and optimized performance
- Clear, transparent pricing in USD
- Professional and trustworthy visual language

### Inspired by Industry Leaders

- **Zocdoc**: Provider discovery, verification, and transparency
- **Fresha**: Team management and pay structure
- **SimplyBook.me**: SMS reminders and medical records
- **Planfy**: Multi-channel booking and patient database

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd beautybook
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_SECRET_KEY="..."
```

4. Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

5. Seed the database (optional)
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
beautybook/
├── app/                      # Next.js app directory
│   ├── providers/           # Provider search and details
│   │   ├── page.tsx        # Search listing page
│   │   └── [id]/           # Provider detail pages
│   │       ├── page.tsx    # Provider profile
│   │       └── book/       # Booking flow
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── ProviderCard.tsx   # Provider listing card
│   ├── FilterSidebar.tsx  # Search filters
│   └── ReviewCard.tsx     # Review display
├── lib/                   # Utilities and shared code
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   └── mock-data.ts      # Development mock data
├── prisma/               # Database schema and migrations
└── public/              # Static assets
```

## Key Pages

- `/` - Homepage with search and features
- `/providers` - Provider search and listing
- `/providers/[id]` - Provider profile with reviews
- `/providers/[id]/book` - Booking flow
- `/dashboard` - Customer dashboard (coming soon)
- `/provider-dashboard` - Provider management (coming soon)

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Homepage and landing pages
- [x] Provider search with filters (Zocdoc-style)
- [x] Provider profile pages
- [x] Review system
- [x] Booking flow with calendar
- [x] Responsive design

### Phase 2: Database Integration (In Progress)
- [ ] Prisma schema design
- [ ] PostgreSQL setup
- [ ] API routes for CRUD operations
- [ ] Real data migration from mock data

### Phase 3: Authentication & User Management
- [ ] NextAuth.js integration
- [ ] Customer registration and login
- [ ] Provider registration and verification
- [ ] Role-based access control

### Phase 4: Booking Management
- [ ] Google Calendar API integration
- [ ] Real-time availability sync
- [ ] Booking confirmation system
- [ ] Email/SMS notifications

### Phase 5: Payment Integration
- [ ] Stripe integration
- [ ] Deposit and full payment
- [ ] Refund handling
- [ ] Receipt generation

### Phase 6: Advanced Features
- [ ] Customer profiles and history
- [ ] Provider analytics dashboard
- [ ] Photo upload and AI analysis
- [ ] Marketing automation
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@beautybook.com or join our Slack channel.

---

Built with ❤️ for the beauty and wellness industry
