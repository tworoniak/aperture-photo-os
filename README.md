# Aperture v1.0 - Photo Business OS

A full-stack photography business management application built with React, TypeScript, and Tailwind CSS. Designed as a private, role-based web app for photographers to manage clients, bookings, shoots, gear, pricing, and client proofing galleries — all in one place.

---

## Screenshots

### Admin

![Aperture Portal Login.](/src/assets/screenshots/screen-00.png 'Aperture Portal Login.')
![Aperture Portal Dashboard.](/src/assets/screenshots/screen-01.png 'Aperture Portal Dashboard.')
![Aperture Portal Clients.](/src/assets/screenshots/screen-02.png 'Aperture Portal Clients.')
![Aperture Portal Bookings.](/src/assets/screenshots/screen-03.png 'Aperture Portal Bookings.')
![Aperture Portal Shoots.](/src/assets/screenshots/screen-04.png 'Aperture Portal Shoots.')
![Aperture Portal Gear.](/src/assets/screenshots/screen-05.png 'Aperture Portal Gear.')
![Aperture Pricing Gear.](/src/assets/screenshots/screen-06.png 'Aperture Portal Pricing.')
![Aperture Pricing Galleries.](/src/assets/screenshots/screen-07.png 'Aperture Portal Galleries.')

### Client

![Aperture Portal Client Gallery.](/src/assets/screenshots/client-screen-01.png 'Aperture Portal Client Gallery.')

---

## Features

- **Dashboard** — Business overview with revenue stats, 6-month area chart, upcoming bookings, and recent clients
- **CRM** — Client and lead management with shoot history, revenue tracking, profile sheet, and full CRUD
- **Bookings** — Calendar and list views with session types, deposit tracking, contract status, and shoot linking
- **Shoot Planner** — Per-shoot detail pages with interactive shot list, mood board, location notes, gear kit selector, and weather placeholder
- **Gear Inventory** — Grouped and flat views with condition badges, insurance values, and mark as needs repair
- **Pricing Calculator** — Package cards with add-ons, custom line items, discount codes, and downloadable HTML quote
- **Client Proofing Gallery** — Masonry grid with lightbox, slideshow mode, keyboard shortcuts, per-photo approve/reject/favourite/comment, and individual photo downloads
- **Mobile responsive** — Slide-in drawer navigation, card-based list views on small screens

---

## Tech Stack

| Layer      | Technology                                                                   |
| ---------- | ---------------------------------------------------------------------------- |
| Framework  | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite 7](https://vitejs.dev)                                                 |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com) + [SCSS](https://sass-lang.com)   |
| Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI + Maia theme)                   |
| Auth       | [Clerk](https://clerk.com)                                                   |
| Database   | [Supabase](https://supabase.com) (Postgres + Row Level Security)             |
| Storage    | [Cloudinary](https://cloudinary.com) (photo uploads + transformations)       |
| Routing    | [React Router v6](https://reactrouter.com)                                   |
| Charts     | [Recharts](https://recharts.org)                                             |
| Forms      | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)      |
| Icons      | [Lucide React](https://lucide.dev)                                           |
| Dates      | [date-fns](https://date-fns.org)                                             |

---

## Project Structure

```
src/
├── main.tsx                          # Entry point — ClerkProvider + BrowserRouter
├── App.tsx                           # Full route tree
├── index.css                         # Tailwind v4 + custom theme tokens
│
├── types/
│   └── index.ts                      # Shared TypeScript types
│
├── lib/
│   ├── utils.ts                      # cn() helper (clsx + tailwind-merge)
│   ├── supabase.ts                   # Supabase client
│   ├── cloudinary.ts                 # Cloudinary upload utility
│   ├── nav-items.ts                  # Shared nav item definitions
│   ├── gear-helpers.ts               # Gear category/condition constants
│   ├── booking-helpers.ts            # Booking status/session type constants
│   ├── generate-quote-pdf.ts         # HTML quote export
│   ├── mock-data.ts                  # Dashboard placeholder data
│   ├── mock-packages.ts              # Default pricing packages
│   ├── schemas/
│   │   ├── client-schema.ts          # Zod schema for client form
│   │   ├── booking-schema.ts         # Zod schema for booking form
│   │   ├── gear-schema.ts            # Zod schema for gear form
│   │   └── shoot-schema.ts           # Zod schema for shoot form
│   └── db/
│       ├── clients.ts                # Clients data access layer
│       ├── bookings.ts               # Bookings data access layer
│       ├── shoots.ts                 # Shoots data access layer
│       ├── gear.ts                   # Gear data access layer
│       ├── galleries.ts              # Galleries data access layer
│       └── pricing.ts                # Pricing packages data access layer
│
├── hooks/
│   ├── useAuth.ts                    # Wraps Clerk — exposes user, isAdmin, isClient
│   ├── useSupabase.ts                # Supabase client with Clerk JWT
│   └── useDarkMode.ts                # Dark mode toggle with localStorage
│
├── routes/
│   └── ProtectedRoute.tsx            # Role-based route guard
│
├── styles/
│   └── globals.scss                  # Gallery grids, photo hovers, page transitions
│
├── pages/
│   ├── index.tsx                     # Page exports
│   ├── LoginPage.tsx                 # Clerk hosted sign-in UI
│   ├── admin/
│   │   ├── DashboardPage.tsx         # Business overview dashboard
│   │   ├── ClientsPage.tsx           # CRM
│   │   ├── BookingsPage.tsx          # Bookings + calendar
│   │   ├── ShootsPage.tsx            # Shoot list
│   │   ├── ShootDetailPage.tsx       # Shoot planner detail
│   │   ├── GearPage.tsx              # Gear inventory
│   │   ├── GalleriesPage.tsx         # Gallery management
│   │   └── PricingPage.tsx           # Pricing + quote builder
│   └── client/
│       └── PublicGalleryPage.tsx     # Public proofing gallery via token link
│
└── components/
    ├── layout/
    │   ├── AdminLayout.tsx           # Sidebar + nav for photographer
    │   ├── ClientLayout.tsx          # Sidebar + nav for clients
    │   └── MobileNav.tsx             # Mobile drawer navigation
    ├── dashboard/
    │   ├── StatCard.tsx              # KPI stat card
    │   ├── RevenueChart.tsx          # 6-month area chart
    │   ├── UpcomingBookings.tsx      # Upcoming bookings list
    │   └── RecentClients.tsx         # Recent clients list
    ├── crm/
    │   ├── ClientCard.tsx            # Mobile client card
    │   ├── ClientDialog.tsx          # Add/edit client dialog
    │   ├── ClientForm.tsx            # Client form
    │   ├── ClientProfileSheet.tsx    # Client profile slide-out
    │   └── DeleteClientDialog.tsx    # Delete confirmation
    ├── bookings/
    │   ├── BookingCard.tsx           # Mobile booking card
    │   ├── BookingCalendar.tsx       # Month calendar view
    │   ├── BookingDialog.tsx         # Add/edit booking dialog
    │   ├── BookingForm.tsx           # Booking form
    │   └── BookingList.tsx           # Desktop table view
    ├── shoots/
    │   ├── ShootCard.tsx             # Shoot list card with progress bar
    │   └── ShootDialog.tsx           # Add/edit shoot dialog
    ├── gear/
    │   ├── GearCard.tsx              # Mobile gear card
    │   ├── GearDialog.tsx            # Add/edit gear dialog
    │   ├── GearForm.tsx              # Gear form
    │   └── DeleteGearDialog.tsx      # Delete confirmation
    ├── gallery/
    │   └── PhotoUploader.tsx         # Drag and drop + URL photo uploader
    ├── pricing/
    │   ├── PackageCard.tsx           # Pricing package card
    │   └── QuoteBuilder.tsx          # Interactive quote builder
    └── ui/                           # shadcn/ui components (owned by this repo)
```

---

## Route Map

| Path              | Access | Description                             |
| ----------------- | ------ | --------------------------------------- |
| `/login`          | Public | Clerk sign-in                           |
| `/gallery/:token` | Public | Shared proofing gallery via unique link |
| `/dashboard`      | Admin  | Business overview                       |
| `/clients`        | Admin  | CRM — client and lead management        |
| `/bookings`       | Admin  | Booking management                      |
| `/shoots`         | Admin  | Shoot planner list                      |
| `/shoots/:id`     | Admin  | Shoot detail and planner                |
| `/gear`           | Admin  | Gear inventory                          |
| `/pricing`        | Admin  | Package and quote builder               |
| `/galleries`      | Admin  | Gallery management                      |
| `/my-gallery`     | Client | Client's own gallery                    |
| `/my-bookings`    | Client | Client's upcoming bookings              |
| `/my-contracts`   | Client | Client's signed contracts               |
| `/my-invoices`    | Client | Client's invoices                       |

---

## Database Schema

Six tables in Supabase Postgres, all protected by Row Level Security scoped to the authenticated photographer's user ID:

| Table              | Description                                        |
| ------------------ | -------------------------------------------------- |
| `clients`          | Client records with status, revenue, shoot count   |
| `bookings`         | Session bookings with deposit and contract state   |
| `shoots`           | Shoot planners with JSONB shot list and mood board |
| `gear`             | Gear inventory with category and condition         |
| `pricing_packages` | Reusable pricing packages with JSONB add-ons       |
| `galleries`        | Proofing galleries with JSONB photo array          |

Public gallery access is granted via a unique token without requiring authentication.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account (free tier)
- A [Supabase](https://supabase.com) account (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/aperture-photo-os.git
cd aperture-photo-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Add your credentials to `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

```bash
# Start the dev server
npm run dev
```

### Database setup

Run the schema SQL in your Supabase SQL Editor — find it at `supabase/schema.sql`.

### Setting yourself as admin

After signing in for the first time, go to your **Clerk dashboard**:

1. Navigate to **Users** → select your account
2. Open **Public metadata**
3. Add the following and save:

```json
{ "role": "admin" }
```

Sign out and back in — you'll land on `/dashboard` with the full admin sidebar. All other users default to the `client` role automatically.

---

## Environment Variables

| Variable                        | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY`    | Clerk publishable key from your Clerk dashboard |
| `VITE_SUPABASE_URL`             | Supabase project URL                            |
| `VITE_SUPABASE_ANON_KEY`        | Supabase anon/public key                        |
| `VITE_CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name                           |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name          |

Create a `.env.example` at the root with empty values for each of the above.

---

## Roadmap

- [x] Project scaffold — Vite + React + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui (Radix, Maia theme)
- [x] Cool slate theme + dark mode
- [x] Clerk authentication + protected routes
- [x] Admin and client layouts + mobile responsive nav
- [x] Dashboard — stats, revenue chart, bookings, clients
- [x] CRM — client list, lead pipeline, add/edit/delete, profile sheet
- [x] Bookings — calendar + list views, session types, deposits, contracts
- [x] Shoot planner — shot lists, mood boards, gear kits, location notes
- [x] Gear inventory — grouped/flat views, condition badges, insurance values
- [x] Pricing calculator — packages, add-ons, discount codes, PDF quote export
- [x] Client proofing gallery — approve/reject/favourite/comment/download
- [x] Cloudinary photo uploads with per-gallery subfolders
- [x] Supabase backend — real database with Row Level Security
- [x] Deployed on Vercel
- [ ] Dashboard wired to live Supabase data
- [ ] Package editor — add/edit pricing packages in UI
- [ ] Client selector in booking form
- [ ] Zip download for approved gallery photos (requires Cloudinary paid plan)

---

## License

Private — all rights reserved.
