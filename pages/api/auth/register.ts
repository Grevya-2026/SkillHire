import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { hashPassword, signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, name, role } = req.body

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (!['professional', 'customer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const db = supabaseAdmin()

  // Check existing user
  const { data: existing } = await db
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const password_hash = await hashPassword(password)

  const { data: user, error } = await db
    .from('users')
    .insert({ email, password_hash, name, role })
    .select()
    .single()

  if (error) return res.status(500).json({ error: 'Failed to create user' })

  const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name })

  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
}
