# DJcovery

A comprehensive platform connecting DJs, organizers, and fans in the electronic music industry. Discover talent, book gigs, manage events, and build your music career.

## 🎯 Overview

DJcovery is a multi-role platform that serves:
- **DJs**: Showcase profiles, get discovered, apply for gigs, manage bookings, and track analytics
- **Organizers**: Post gigs, find talent, manage bookings, and build their brand
- **Fans**: Follow favorite DJs, discover events, and engage with the community
- **Admins**: Manage users, approve profiles, review reports, and oversee platform operations

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma v7
- **Authentication**: Supabase Auth
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React, FontAwesome
- **Forms**: React Hook Form with Zod validation
- **Storage**: Supabase Storage (djscovery-media bucket)
- **Email**: Resend
- **Deployment**: Vercel

## ✨ Key Features

### For DJs
- **Profile Management**: Create detailed profiles with genres, experience, social links, and media
- **Gig Marketplace**: Browse and apply for gigs from organizers worldwide
- **Booking System**: Receive and manage booking inquiries with masked messaging
- **Analytics Dashboard**: Track profile views, engagement, and performance metrics
- **Events**: Create and manage event listings with posters, lineups, and recaps
- **Premium Features**: Packages, career highlights, endorsements, press coverage, availability calendar

### For Organizers
- **Gig Posting**: Create detailed gig listings with requirements, budget, and equipment specs
- **DJ Discovery**: Search and filter DJs by genre, location, experience, and reputation
- **Booking Management**: Send booking inquiries, review applications, and manage communications
- **Profile Building**: Showcase brand with logos, cover images, and social links
- **Application Review**: Shortlist, accept, or reject DJ applications with detailed tracking

### For Fans
- **DJ Discovery**: Browse directory with advanced filters
- **Follow System**: Follow favorite DJs and track their activity
- **Event Discovery**: Find upcoming events and save favorites
- **Community Engagement**: Comment on profiles, like posts, and participate in discussions

### Platform Features
- **Community Feed**: Social feed with posts, comments, and likes
- **Rating System**: 5-star ratings with reviews for DJs, gigs, and events
- **Notifications**: Real-time notifications for all key actions
- **Reputation System**: Algorithmic scoring based on profile quality, reviews, and activity
- **Geographic Support**: Country/city-based filtering and search
- **Multi-language Support**: Infrastructure for internationalization
- **Admin Panel**: Comprehensive admin tools for user management and content moderation

## 📁 Project Structure

```
djscovery/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeding
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── admin/           # Admin panel
│   │   ├── djs/             # DJ profiles
│   │   ├── events/          # Events listing
│   │   ├── gigs/            # Gigs marketplace
│   │   ├── organizer/       # Organizer dashboard
│   │   ├── fan/             # Fan dashboard
│   │   └── dashboard/       # Legacy dashboards
│   ├── components/          # React components
│   │   ├── admin/          # Admin components
│   │   ├── booking/        # Booking flow components
│   │   ├── dj-profile/     # DJ profile components
│   │   └── ...
│   ├── lib/                # Utility functions
│   │   ├── actions/        # Server actions
│   │   ├── validations/    # Zod schemas
│   │   └── ...
│   └── config/             # Configuration files
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 20.19
- PostgreSQL database (Supabase recommended)
- Supabase project for auth and storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd djscovery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url

   # Database
   DATABASE_URL=postgresql://user:password@host:port/database

   # Environment
   NEXT_PUBLIC_APP_ENV=development

   # Email (Resend)
   RESEND_API_KEY=your-resend-api-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Redis (Upstash) - optional for caching
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npx prisma db push

   # Generate Prisma client
   npx prisma generate

   # Seed database (optional)
   npm run seed
   ```

5. **Create admin user**
   ```bash
   npm run create-admin
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with demo data
- `npm run create-admin` - Create admin user

## 🌍 Environments

- **Development**: Local development with `.env.local`
- **Staging**: Uses staging Supabase (`jarmybsjvztwrmsdcnje.supabase.co`)
- **Production**: Uses production Supabase (`unrqebwfdfumpjgvavbk.supabase.co`)

Set `NEXT_PUBLIC_APP_ENV=staging` or `production` accordingly.

## 🗄️ Database Schema

The database uses Prisma ORM with PostgreSQL. Key models include:

- **User**: Base user model with authentication
- **DjProfile**: DJ profiles with genres, media, ratings
- **OrganizerProfile**: Organizer profiles with gigs
- **FanProfile**: Fan profiles with follows
- **Gig**: Gig listings with applications
- **Event**: Event listings with participants
- **BookingInquiry**: Booking requests with messaging
- **Post**: Community feed posts
- **Notification**: System notifications

See `prisma/schema.prisma` for the complete schema.

## 🔐 Authentication

DJcovery uses Supabase Auth for authentication. The system supports:
- Email/password authentication
- Role-based access control (DJ, Organizer, Fan, Admin)
- Protected routes with middleware
- Session management with Supabase SSR

## 📧 Email System

Email notifications are powered by Resend. Supported email types:
- Welcome emails
- Profile approval/rejection
- Gig application updates
- Booking inquiries
- Account suspension
- Contact form submissions

## 🚢 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main` branch

### Manual Deployment

```bash
npm run build
npm start
```

### Cron Jobs

Vercel cron jobs are configured in `vercel.json`:
- Daily event completion check at 6:00 UTC

## 📱 Screenshots Needed

Add the following screenshots to the `public/` folder to showcase the platform:

### Essential Screenshots
1. **home-screenshot.png** - Homepage hero section and main features
2. **directory-screenshot.png** - DJ directory with filters and search
3. **dj-profile-screenshot.png** - Complete DJ profile page with media, ratings, and booking CTA
4. **gigs-marketplace-screenshot.png** - Gigs listing page with filters
5. **gig-detail-screenshot.png** - Individual gig page with application form
6. **events-screenshot.png** - Events listing page
7. **event-detail-screenshot.png** - Event page with lineup and details
8. **booking-modal-screenshot.png** - Booking inquiry modal
9. **dj-dashboard-screenshot.png** - DJ dashboard with analytics
10. **organizer-dashboard-screenshot.png** - Organizer dashboard with gigs overview

### Optional Screenshots
11. **community-feed-screenshot.png** - Community feed with posts
12. **fan-dashboard-screenshot.png** - Fan profile with followed DJs
13. **admin-panel-screenshot.png** - Admin panel overview
14. **mobile-nav-screenshot.png** - Mobile navigation and responsive design
15. **booking-messages-screenshot.png** - Booking inquiry messaging thread

### Screenshot Guidelines
- Use 1920x1080 resolution for desktop screenshots
- Use 390x844 resolution for mobile screenshots
- Ensure consistent branding and no sensitive data
- Use demo/test accounts for all screenshots
- Include realistic content (not empty states)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and the modern React ecosystem
- UI components from shadcn/ui
- Icons from Lucide React and FontAwesome
- Authentication and storage powered by Supabase
- Database managed with Prisma

## 📞 Support

For support, email support@djscovery.com or use the contact form on the platform.

---

**Note**: DJcovery requires users to be at least 18 years old (Swedish law compliance).
