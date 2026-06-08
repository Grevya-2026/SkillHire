-- SkillHire Database Schema
-- Run this in your Supabase SQL editor

-- Users table (professionals and customers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('professional', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professionals profile table
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  profession TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  audio_url TEXT,
  video_url TEXT,
  avatar_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  hours DECIMAL(4,1) NOT NULL,
  rate_per_hour DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_professionals_profession ON professionals(profession);
CREATE INDEX IF NOT EXISTS idx_professionals_available ON professionals(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional ON bookings(professional_id);

-- Storage buckets (run in Supabase dashboard > Storage)
-- Create bucket named "skillhire-media" with public access

-- Enable RLS (Row Level Security) - optional for added security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
