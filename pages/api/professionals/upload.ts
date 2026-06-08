import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { getTokenFromRequest } from '../../../lib/auth'
import { v4 as uuidv4 } from 'uuid'

export const config = { api: { bodyParser: { sizeLimit: '100mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = getTokenFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { fileData, fileName, fileType, mediaType } = req.body
  // fileData: base64 string, mediaType: 'audio' | 'video' | 'avatar'

  if (!fileData || !fileName || !fileType) {
    return res.status(400).json({ error: 'File data, name, and type required' })
  }

  const db = supabaseAdmin()
  const ext = fileName.split('.').pop()
  const uniqueName = `${user.userId}/${mediaType}/${uuidv4()}.${ext}`

  // Convert base64 to buffer
  const base64Data = fileData.replace(/^data:[^;]+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const { data, error } = await db.storage
    .from('skillhire-media')
    .upload(uniqueName, buffer, {
      contentType: fileType,
      upsert: true,
    })

  if (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed: ' + error.message })
  }

  const { data: urlData } = db.storage.from('skillhire-media').getPublicUrl(uniqueName)

  return res.status(200).json({ url: urlData.publicUrl, path: uniqueName })
}
