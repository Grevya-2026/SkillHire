import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'

export const config = { api: { bodyParser: { sizeLimit: '50mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('professionals')
      .select('*, users(email)')
      .eq('id', id)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Professional not found' })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    const user = getTokenFromRequest(req)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // Verify ownership
    const { data: prof } = await db.from('professionals').select('user_id').eq('id', id).single()
    if (!prof || prof.user_id !== user.userId) return res.status(403).json({ error: 'Forbidden' })

    const { name, age, profession, experience_years, description, hourly_rate, audio_url, video_url, avatar_url, is_available } = req.body

    const { data, error } = await db
      .from('professionals')
      .update({ name, age: parseInt(age), profession, experience_years: parseInt(experience_years), description, hourly_rate: parseFloat(hourly_rate), audio_url, video_url, avatar_url, is_available })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Failed to update profile' })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
