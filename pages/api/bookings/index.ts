import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getTokenFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    let query = db.from('bookings').select('*, professionals(id, name, profession, avatar_url, hourly_rate), users(name, email)')

    if (user.role === 'customer') {
      query = query.eq('customer_id', user.userId)
    } else {
      // Professional sees their bookings
      const { data: prof } = await db.from('professionals').select('id').eq('user_id', user.userId).single()
      if (!prof) return res.status(200).json([])
      query = query.eq('professional_id', prof.id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: 'Failed to fetch bookings' })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (user.role !== 'customer') return res.status(403).json({ error: 'Only customers can make bookings' })

    const { professional_id, hours, rate_per_hour, scheduled_date, notes } = req.body

    if (!professional_id || !hours || !rate_per_hour || !scheduled_date) {
      return res.status(400).json({ error: 'Professional, hours, rate, and date are required' })
    }

    const total_amount = parseFloat(hours) * parseFloat(rate_per_hour)

    const { data, error } = await db
      .from('bookings')
      .insert({ customer_id: user.userId, professional_id, hours: parseFloat(hours), rate_per_hour: parseFloat(rate_per_hour), total_amount, scheduled_date, notes, status: 'pending' })
      .select('*, professionals(name, profession)')
      .single()

    if (error) return res.status(500).json({ error: 'Failed to create booking' })

    // Increment booking count
    await db.rpc('increment_bookings', { prof_id: professional_id }).catch(() => {})

    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
