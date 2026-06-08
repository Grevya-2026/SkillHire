import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function ProfileEdit() {
  const router = useRouter()
  const isNew = router.query.new === 'true'
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', age: '', profession: '', experience_years: '',
    description: '', hourly_rate: '', is_available: true,
  })
  const [audioUrl, setAudioUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState<{ audio?: boolean; video?: boolean; avatar?: boolean }>({})
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const audioRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('skillhire_token') : null

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('skillhire_user') || 'null')
    if (!user || user.role !== 'professional') { router.push('/login'); return }

    if (!isNew) {
      fetch('/api/professionals', { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json())
        .then(async (all) => {
          // find own profile
          const res = await fetch(`/api/professionals?own=true`, { headers: { Authorization: `Bearer ${token()}` } })
          // Actually get all and filter client-side won't work well - let's fetch by user
          // Try to get profile directly
          const profRes = await fetch(`/api/professionals/me`, { headers: { Authorization: `Bearer ${token()}` } })
          if (profRes.ok) {
            const prof = await profRes.json()
            setProfileId(prof.id)
            setForm({ name: prof.name, age: prof.age, profession: prof.profession, experience_years: prof.experience_years, description: prof.description || '', hourly_rate: prof.hourly_rate, is_available: prof.is_available })
            setAudioUrl(prof.audio_url || '')
            setVideoUrl(prof.video_url || '')
            setAvatarUrl(prof.avatar_url || '')
          }
          setLoading(false)
        })
    } else {
      const user = JSON.parse(localStorage.getItem('skillhire_user') || '{}')
      setForm(f => ({ ...f, name: user.name || '' }))
    }
  }, [])

  const uploadFile = async (file: File, type: 'audio' | 'video' | 'avatar') => {
    setUploading(u => ({ ...u, [type]: true }))
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const res = await fetch('/api/professionals/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ fileData: reader.result, fileName: file.name, fileType: file.type, mediaType: type }),
        })
        const data = await res.json()
        if (res.ok) {
          if (type === 'audio') setAudioUrl(data.url)
          if (type === 'video') setVideoUrl(data.url)
          if (type === 'avatar') setAvatarUrl(data.url)
        } else {
          setError(data.error)
        }
      } catch (e) {
        setError('Upload failed')
      } finally {
        setUploading(u => ({ ...u, [type]: false }))
      }
    }
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    const body = { ...form, audio_url: audioUrl, video_url: videoUrl, avatar_url: avatarUrl }
    try {
      const method = profileId ? 'PUT' : 'POST'
      const url = profileId ? `/api/professionals/${profileId}` : '/api/professionals'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.profileId) { setProfileId(data.profileId); setError('Profile already exists — loaded it for editing.') }
        else throw new Error(data.error)
      } else {
        setProfileId(data.id)
        setSuccess('Profile saved successfully!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 100 }} />

  return (
    <>
      <Head><title>{isNew ? 'Create Profile' : 'Edit Profile'} — SkillHire</title></Head>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 5%' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{isNew ? 'Create Your Profile' : 'Edit Profile'}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Help customers find you by filling out your professional profile.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={save}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal), var(--ink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', color: 'white', overflow: 'hidden', flexShrink: 0,
            }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.name?.[0] || '👤')}
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Profile Photo</p>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'avatar')} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => avatarRef.current?.click()} disabled={uploading.avatar}>
                {uploading.avatar ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" required min="18" max="80" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Profession *</label>
              <input className="form-input" required placeholder="e.g. Plumber, Electrician" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years) *</label>
              <input className="form-input" type="number" required min="0" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hourly Rate (₹) *</label>
            <input className="form-input" type="number" required min="1" placeholder="e.g. 500" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={4} placeholder="Tell customers about yourself, your skills, and your work..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Audio upload */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 10 }}>🎙️ Audio Introduction</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 12 }}>Record a short audio intro to let customers hear from you directly.</p>
            <input ref={audioRef} type="file" accept="audio/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'audio')} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => audioRef.current?.click()} disabled={uploading.audio}>
                {uploading.audio ? 'Uploading...' : 'Upload Audio'}
              </button>
              {audioUrl && <audio controls src={audioUrl} style={{ height: 36 }} />}
            </div>
          </div>

          {/* Video upload */}
          <div className="card" style={{ padding: 20, marginBottom: 28 }}>
            <h3 style={{ marginBottom: 10 }}>🎬 Video Introduction</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 12 }}>Upload a short video showcasing your work or introducing yourself.</p>
            <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'video')} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => videoRef.current?.click()} disabled={uploading.video}>
                {uploading.video ? 'Uploading...' : 'Upload Video'}
              </button>
              {videoUrl && (
                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 200, borderRadius: 8, marginTop: 10 }} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <input type="checkbox" id="available" checked={form.is_available}
              onChange={e => setForm({ ...form, is_available: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="available" style={{ fontWeight: 600, cursor: 'pointer' }}>I am available for bookings</label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </>
  )
}
