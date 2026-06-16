# UPS Store Hiring Portal

A production-ready hiring portal for local UPS Store franchise owners, built as a **Next.js full-stack app** deployable to **Vercel** with **Neon PostgreSQL** and **UploadThing** cloud resume storage.

## Features

- Public hiring page with online application form
- Resume upload to cloud storage (UploadThing — no local disk)
- Admin dashboard with search, filters, and status management
- Applicant detail view with notes and resume download
- JWT auth with secure httpOnly cookies
- Optional email notifications via Nodemailer
- Mobile-friendly UPS-branded design

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via [Neon](https://neon.tech) + Prisma ORM
- **File Storage:** [UploadThing](https://uploadthing.com)
- **Deployment:** Vercel
- **Auth:** JWT + bcrypt

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- An [UploadThing](https://uploadthing.com) account (free tier works)
- (Optional) SMTP credentials for email notifications

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (use **pooled** URL for serverless) |
| `JWT_SECRET` | Long random string for session signing |
| `ADMIN_EMAIL` | Default admin login email |
| `ADMIN_PASSWORD` | Default admin login password |
| `UPLOADTHING_TOKEN` | From [UploadThing Dashboard](https://uploadthing.com/dashboard) |
| `STORE_NAME` | Your store display name |
| `STORE_ADDRESS` | Store address shown in header |
| `OWNER_EMAIL` | Owner contact / notification email |
| `PRIMARY_COLOR` | Brand color (default `#351C15`) |
| `ACCENT_COLOR` | Accent color (default `#FFB500`) |

### 3. Set up the database

Push the Prisma schema to your Neon database:

```bash
npm run db:push
```

Create the default admin account:

```bash
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

- **Public site:** http://localhost:3000
- **Admin login:** http://localhost:3000/admin/login

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no custom build settings needed

### 3. Add environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add all variables from `.env.example`:

```
DATABASE_URL
JWT_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
UPLOADTHING_TOKEN
STORE_NAME
STORE_ADDRESS
OWNER_EMAIL
PRIMARY_COLOR
ACCENT_COLOR
SMTP_HOST        (optional)
SMTP_PORT        (optional)
SMTP_USER        (optional)
SMTP_PASS        (optional)
```

**Important:** Use Neon's **pooled connection string** for `DATABASE_URL` on Vercel (ends with `-pooler`).

### 4. Deploy

```bash
npm i -g vercel
vercel deploy
```

Or push to your main branch for automatic deployments.

### 5. Initialize production database

After first deploy, run locally against your production Neon DB:

```bash
npm run db:push
npm run db:seed
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
npm run db:push
npm run db:seed
```

## Neon PostgreSQL Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the **pooled connection string** from the Neon dashboard
4. Set it as `DATABASE_URL` in `.env` and Vercel

Example:

```
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## UploadThing Setup

1. Create a free account at [uploadthing.com](https://uploadthing.com)
2. Create a new app in the dashboard
3. Copy the **API Token** (starts with `sk_live_` or `sk_test_`)
4. Set it as `UPLOADTHING_TOKEN` in `.env` and Vercel

Resumes are stored in UploadThing's cloud — no local disk or S3 bucket needed.

## Email Notifications (Optional)

Configure SMTP in environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
OWNER_EMAIL=owner@theupsstore.com
```

If SMTP is not configured, the app works normally without sending emails.

## Store Configuration

Customize in `.env` or Vercel environment variables:

```env
STORE_NAME=The UPS Store #1234 - Hiring
STORE_ADDRESS=456 Commerce Blvd, Springfield, IL 62701
OWNER_EMAIL=owner@store1234.com
PRIMARY_COLOR=#351C15
ACCENT_COLOR=#FFB500
```

Frontend defaults are documented in `src/config/storeSettings.ts`.

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Admin seed script
├── public/
├── src/
│   ├── app/
│   │   ├── api/            # API routes (serverless)
│   │   ├── admin/          # Admin pages
│   │   ├── page.tsx        # Public hiring page
│   │   └── success/        # Application success page
│   ├── components/         # React components
│   ├── config/             # Store settings defaults
│   └── lib/                # Prisma, auth, email, validation
├── .env.example
├── vercel.json
└── README.md
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/config` | Store configuration |
| POST | `/api/applications` | Submit application |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/logout` | Admin logout |
| GET | `/api/admin/me` | Current session |
| GET | `/api/admin/applicants` | List applicants |
| GET | `/api/admin/applicants/:id` | Applicant detail |
| PATCH | `/api/admin/applicants/:id/status` | Update status |
| PATCH | `/api/admin/applicants/:id/notes` | Update notes |
| DELETE | `/api/admin/applicants/:id` | Delete applicant |
| GET | `/api/admin/applicants/:id/resume` | Download resume |
| POST | `/api/uploadthing` | Resume upload handler |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Create default admin |
| `npm run db:studio` | Open Prisma Studio |

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT in httpOnly cookies
- Admin routes protected by middleware
- Resume files stored in cloud (UploadThing), served via authenticated redirect
- Input validation with Zod on all API endpoints
- No local file system storage in production

## Applicant Status Workflow

1. **New** — Just submitted (default)
2. **Reviewing** — Under review
3. **Interview** — Invited for interview
4. **Hired** — Hired
5. **Rejected** — Declined
