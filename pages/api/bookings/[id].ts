import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })

  const user = getTokenFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  const { status } = req.body
  const db = supabaseAdmin()

  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  // Get booking to check permissions
  const { data: booking } = await db.from('bookings').select('*, professionals(user_id)').eq('id', id).single()
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const isProfOwner = booking.professionals?.user_id === user.userId
  const isCustomer = booking.customer_id === user.userId

  if (!isProfOwner && !isCustomer) return res.status(403).json({ error: 'Forbidden' })
  // Customers can only cancel, professionals can confirm/complete/cancel
  if (isCustomer && status !== 'cancelled') return res.status(403).json({ error: 'Customers can only cancel bookings' })

  const { data, error } = await db
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: 'Failed to update booking' })
  return res.status(200).json(data)
}
