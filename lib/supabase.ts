import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with elevated privileges
export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey)
}

export type UserRole = 'professional' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Professional {
  id: string
  user_id: string
  name: string
  age: number
  profession: string
  experience_years: number
  description: string
  hourly_rate: number
  audio_url?: string
  video_url?: string
  avatar_url?: string
  is_available: boolean
  rating: number
  total_bookings: number
  created_at: string
  users?: User
}

export interface Booking {
  id: string
  customer_id: string
  professional_id: string
  hours: number
  rate_per_hour: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  scheduled_date: string
  notes?: string
  created_at: string
  professionals?: Professional
  users?: User
}
