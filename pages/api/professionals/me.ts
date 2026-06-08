import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getTokenFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const db = supabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('professionals')
      .select('*')
      .eq('user_id', user.userId)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Profile not found' })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
