import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'

export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { profession, search, available } = req.query

    let query = db
      .from('professionals')
      .select('*, users(email)')
      .order('rating', { ascending: false })

    if (profession) query = query.ilike('profession', `%${profession}%`)
    if (search) query = query.or(`name.ilike.%${search}%,profession.ilike.%${search}%,description.ilike.%${search}%`)
    if (available === 'true') query = query.eq('is_available', true)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Failed to fetch professionals' })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const user = getTokenFromRequest(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (user.role !== 'professional') return res.status(403).json({ error: 'Only professionals can create profiles' })

    // Check if profile already exists
    const { data: existing } = await db.from('professionals').select('id').eq('user_id', user.userId).single()
    if (existing) return res.status(409).json({ error: 'Profile already exists', profileId: existing.id })

    const { name, age, profession, experience_years, description, hourly_rate, audio_url, video_url, avatar_url } = req.body

    if (!name || !age || !profession || !hourly_rate) {
      return res.status(400).json({ error: 'Name, age, profession, and hourly rate are required' })
    }

    const { data, error } = await db
      .from('professionals')
      .insert({ user_id: user.userId, name, age: parseInt(age), profession, experience_years: parseInt(experience_years) || 0, description, hourly_rate: parseFloat(hourly_rate), audio_url, video_url, avatar_url })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Failed to create profile' })
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
