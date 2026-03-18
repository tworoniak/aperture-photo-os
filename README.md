# Aperture v1.0 - Photo Business OS

A full-stack photography business management application built with React, TypeScript, and Tailwind CSS. Designed as a private, role-based web app for photographers to manage clients, bookings, shoots, gear, pricing, and client proofing galleries — all in one place.

---

## Screenshots

![Aperture Portal Dashboard.](/src/assets/screenshots/screen-01.png 'Aperture Portal Dashboard.')
![Aperture Portal Clients.](/src/assets/screenshots/screen-02.png 'Aperture Portal Clients.')
![Aperture Portal Bookings.](/src/assets/screenshots/screen-03.png 'Aperture Portal Bookings.')
![Aperture Portal Shoots.](/src/assets/screenshots/screen-04.png 'Aperture Portal Shoots.')
![Aperture Portal Gear.](/src/assets/screenshots/screen-05.png 'Aperture Portal Gear.')
![Aperture Pricing Gear.](/src/assets/screenshots/screen-06.png 'Aperture Portal Pricing.')
![Aperture Pricing Galleries.](/src/assets/screenshots/screen-07.png 'Aperture Portal Galleries.')

---

## Features

### In progress

- **Dashboard** — Business overview with revenue stats, upcoming bookings, and recent clients

### Planned

- **CRM** — Client and lead management with shoot history and revenue tracking
- **Bookings & Contracts** — Session scheduling, automated contracts, and deposit invoicing
- **Shoot Planner** — Shot list builder, mood boards, location notes, and gear kit assignment
- **Gear Inventory** — Catalog bodies, lenses, and accessories with insurance values and maintenance logs
- **Pricing Calculator** — Interactive package and quote builder
- **Client Proofing Gallery** — Password-protected galleries where clients can approve, reject, favourite, and download selected images

---

## Tech Stack

| Layer      | Technology                                                                   |
| ---------- | ---------------------------------------------------------------------------- |
| Framework  | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite 7](https://vitejs.dev)                                                 |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com) + [SCSS](https://sass-lang.com)   |
| Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI + Maia theme)                   |
| Auth       | [Clerk](https://clerk.com)                                                   |
| Routing    | [React Router v6](https://reactrouter.com)                                   |
| Charts     | [Recharts](https://recharts.org)                                             |
| Forms      | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)      |
| Icons      | [Lucide React](https://lucide.dev)                                           |
| Dates      | [date-fns](https://date-fns.org)                                             |

---

## Project Structure

```
src/
├── main.tsx                        # Entry point — ClerkProvider + BrowserRouter
├── App.tsx                         # Full route tree
├── index.css                       # Tailwind v4 import
│
├── types/
│   └── index.ts                    # Shared TypeScript types
│
├── lib/
│   ├── utils.ts                    # cn() helper (clsx + tailwind-merge)
│   └── mock-data.ts                # Placeholder data (replaced by Supabase later)
│
├── hooks/
│   └── useAuth.ts                  # Wraps Clerk — exposes user, isAdmin, isClient
│
├── routes/
│   └── ProtectedRoute.tsx          # Role-based route guard
│
├── styles/
│   └── globals.scss                # Gallery grids, photo hovers, page transitions
│
├── pages/
│   ├── index.tsx                   # Page exports and stubs
│   ├── LoginPage.tsx               # Clerk hosted sign-in UI
│   └── admin/
│       └── DashboardPage.tsx       # Business overview dashboard
│
└── components/
    ├── layout/
    │   ├── AdminLayout.tsx         # Sidebar + nav for photographer (admin)
    │   └── ClientLayout.tsx        # Sidebar + nav for clients
    ├── dashboard/
    │   ├── StatCard.tsx            # Individual KPI stat card
    │   ├── RevenueChart.tsx        # 6-month area chart (Recharts)
    │   ├── UpcomingBookings.tsx    # Next 30 days booking list
    │   └── RecentClients.tsx       # Latest client activity list
    ├── ui/                         # shadcn/ui components (owned by this repo)
    ├── bookings/                   # (planned)
    ├── crm/                        # (planned)
    ├── gallery/                    # (planned)
    ├── gear/                       # (planned)
    └── pricing/                    # (planned)
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
| `/shoots`         | Admin  | Shoot planner                           |
| `/gear`           | Admin  | Gear inventory                          |
| `/pricing`        | Admin  | Package and quote builder               |
| `/galleries`      | Admin  | Gallery management                      |
| `/my-gallery`     | Client | Client's own gallery                    |
| `/my-bookings`    | Client | Client's upcoming bookings              |
| `/my-contracts`   | Client | Client's signed contracts               |
| `/my-invoices`    | Client | Client's invoices                       |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account (free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/photo-business-os.git
cd photo-business-os

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Add your Clerk publishable key to `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

```bash
# Start the dev server
npm run dev
```

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

| Variable                     | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key from your Clerk dashboard |

Create a `.env.example` at the root with:

```env
VITE_CLERK_PUBLISHABLE_KEY=
```

---

## Roadmap

- [x] Project scaffold — Vite + React + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui (Radix, Maia theme)
- [x] Clerk authentication + protected routes
- [x] Admin and client layouts
- [x] Dashboard — stats, revenue chart, bookings, clients
- [ ] CRM — client list, lead pipeline, add/edit clients
- [ ] Bookings — calendar, session types, contracts
- [ ] Shoot planner — shot lists, mood boards, gear kits
- [ ] Gear inventory — catalog, insurance values, maintenance
- [ ] Pricing calculator — packages, add-ons, quote builder
- [ ] Client proofing gallery — approve/reject/download
- [ ] Supabase integration — replace mock data with real database

---

## License

Private — all rights reserved.
