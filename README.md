# SkillHire — Professional Booking Platform

A full-stack Next.js application where professionals can register, create profiles (with audio/video intros), and customers can browse and book them by the hour.

---

## Tech Stack

- **Frontend + Backend**: Next.js 14 (API Routes)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage (audio, video, avatars)
- **Auth**: JWT (bcrypt password hashing)
- **Deployment**: Vercel

---

## Features

### For Professionals
- Register and create a detailed profile
- Add name, age, profession, experience, description
- Upload a profile photo
- Record/upload an audio introduction
- Upload a video introduction
- Set hourly rate
- Toggle availability
- View and manage incoming bookings (confirm/decline/complete)

### For Customers
- Browse all professionals
- Filter by profession, search by name/skill
- View full profile with audio/video intro
- Book a professional with custom hours and rate
- View booking history and status

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and paste the contents of `supabase-schema.sql` and run it
4. Go to **Storage** → Create a new bucket named `skillhire-media`
   - Set it to **Public** (so media URLs are accessible)
5. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-random-strong-string-here
```

### 3. Install & Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial SkillHire app"
   git remote add origin https://github.com/your-username/skillhire.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. In **Environment Variables**, add all 4 variables from your `.env.local`
5. Click **Deploy**

That's it! Vercel will build and deploy automatically.

---

## Project Structure

```
skillhire/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.ts      # POST /api/auth/register
│   │   │   └── login.ts         # POST /api/auth/login
│   │   ├── professionals/
│   │   │   ├── index.ts         # GET/POST /api/professionals
│   │   │   ├── [id].ts          # GET/PUT /api/professionals/:id
│   │   │   ├── me.ts            # GET /api/professionals/me
│   │   │   └── upload.ts        # POST /api/professionals/upload
│   │   └── bookings/
│   │       ├── index.ts         # GET/POST /api/bookings
│   │       └── [id].ts          # PUT /api/bookings/:id
│   ├── professionals/
│   │   ├── index.tsx            # Browse professionals page
│   │   └── [id].tsx             # Professional detail + booking
│   ├── profile/
│   │   └── edit.tsx             # Professional profile editor
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx                # Homepage
│   ├── login.tsx
│   ├── register.tsx
│   └── dashboard.tsx            # Bookings dashboard
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── supabase.ts              # Supabase client + types
│   └── auth.ts                  # JWT + bcrypt utilities
├── styles/
│   └── globals.css
├── supabase-schema.sql          # Run this in Supabase SQL editor
├── vercel.json
└── .env.local.example
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/professionals | No | List professionals |
| POST | /api/professionals | Yes (Pro) | Create profile |
| GET | /api/professionals/:id | No | Get professional |
| PUT | /api/professionals/:id | Yes (Owner) | Update profile |
| GET | /api/professionals/me | Yes (Pro) | Get own profile |
| POST | /api/professionals/upload | Yes | Upload media file |
| GET | /api/bookings | Yes | List my bookings |
| POST | /api/bookings | Yes (Customer) | Create booking |
| PUT | /api/bookings/:id | Yes | Update booking status |

---

## Customisation Tips

- Change currency from ₹ to $ by searching `₹` in the codebase
- Add payment integration (Razorpay/Stripe) in the booking flow
- Add email notifications using Resend or SendGrid
- Add ratings/reviews after booking completion
- Add real-time notifications using Supabase Realtime
