import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { comparePassword, signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const db = supabaseAdmin()

  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await comparePassword(password, user.password_hash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  // Get professional profile if applicable
  let profile = null
  if (user.role === 'professional') {
    const { data } = await db.from('professionals').select('id').eq('user_id', user.id).single()
    profile = data
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name })

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    profileId: profile?.id || null
  })
}
