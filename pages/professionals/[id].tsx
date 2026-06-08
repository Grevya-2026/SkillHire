import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Professional } from '../../lib/supabase'

export default function ProfessionalDetail() {
  const router = useRouter()
  const { id } = router.query
  const [pro, setPro] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({ hours: 1, rate_per_hour: 0, scheduled_date: '', notes: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('skillhire_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/professionals/${id}`)
      .then(r => r.json())
      .then(data => {
        setPro(data)
        setBooking(b => ({ ...b, rate_per_hour: data.hourly_rate }))
        setLoading(false)
      })
  }, [id])

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('skillhire_token')
    if (!token) { router.push('/login'); return }
    setBookingLoading(true); setBookingError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ professional_id: id, ...booking }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBookingSuccess(true)
    } catch (err: any) {
      setBookingError(err.message)
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: 100 }} />
  if (!pro) return <div style={{ textAlign: 'center', padding: 80 }}>Professional not found</div>

  const total = booking.hours * booking.rate_per_hour

  return (
    <>
      <Head><title>{pro.name} — SkillHire</title></Head>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%' }}>
        <Link href="/professionals" style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Back to professionals
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, marginTop: 24, alignItems: 'start' }}>
          {/* Left: Profile */}
          <div>
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--teal), var(--ink))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontFamily: 'Playfair Display, serif', fontWeight: 700, color: 'white',
                  overflow: 'hidden',
                }}>
                  {pro.avatar_url ? <img src={pro.avatar_url} alt={pro.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pro.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{pro.name}</h1>
                  <p style={{ color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {pro.profession}
                  </p>
                  <div style={{ display: 'flex', gap: 20, fontSize: '0.88rem', color: 'var(--muted)' }}>
                    <span>📅 {pro.experience_years} years experience</span>
                    <span>🎂 Age {pro.age}</span>
                    <span>📋 {pro.total_bookings} jobs done</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex', padding: '6px 14px', borderRadius: 20,
                background: pro.is_available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: pro.is_available ? '#16a34a' : '#dc2626',
                fontWeight: 600, fontSize: '0.85rem', marginBottom: 20,
              }}>
                {pro.is_available ? '● Available for booking' : '● Currently unavailable'}
              </div>

              <h3 style={{ marginBottom: 10 }}>About</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{pro.description || 'No description provided.'}</p>
            </div>

            {/* Audio intro */}
            {pro.audio_url && (
              <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginBottom: 14 }}>🎙️ Audio Introduction</h3>
                <audio controls style={{ width: '100%' }} src={pro.audio_url}>
                  Your browser does not support audio.
                </audio>
              </div>
            )}

            {/* Video intro */}
            {pro.video_url && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 14 }}>🎬 Video Introduction</h3>
                <video controls style={{ width: '100%', borderRadius: 8, maxHeight: 400 }} src={pro.video_url}>
                  Your browser does not support video.
                </video>
              </div>
            )}
          </div>

          {/* Right: Booking card */}
          <div className="card" style={{ padding: 28, position: 'sticky', top: 88 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Book {pro.name}</h2>
            <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: 20 }}>
              ₹{pro.hourly_rate} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.88rem' }}>/ hour</span>
            </p>

            {bookingSuccess ? (
              <div className="alert alert-success" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                <strong>Booking Confirmed!</strong>
                <p style={{ fontSize: '0.88rem', marginTop: 6 }}>Check your dashboard for details.</p>
                <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-block' }}>
                  View Dashboard
                </Link>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                {bookingError && <div className="alert alert-error">{bookingError}</div>}
                {!user && (
                  <div className="alert" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', marginBottom: 16 }}>
                    <Link href="/login" style={{ fontWeight: 600 }}>Login</Link> to book this professional
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Hours Required</label>
                  <input className="form-input" type="number" min="0.5" max="24" step="0.5" required
                    value={booking.hours} onChange={e => setBooking({ ...booking, hours: parseFloat(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate per Hour (₹)</label>
                  <input className="form-input" type="number" min="1" required
                    value={booking.rate_per_hour} onChange={e => setBooking({ ...booking, rate_per_hour: parseFloat(e.target.value) })} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Default: ₹{pro.hourly_rate}/hr — you can negotiate</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time</label>
                  <input className="form-input" type="datetime-local" required
                    value={booking.scheduled_date} onChange={e => setBooking({ ...booking, scheduled_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-textarea" placeholder="Describe the work needed..."
                    value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })}
                    style={{ minHeight: 80 }} />
                </div>

                {/* Total */}
                <div style={{
                  background: 'var(--warm)', borderRadius: 8, padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 16, border: '1px solid var(--border)',
                }}>
                  <span style={{ fontWeight: 600 }}>Total Amount</span>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700 }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn btn-gold btn-full"
                  disabled={bookingLoading || !user || user.role !== 'customer'}
                  style={{ padding: '14px' }}
                >
                  {bookingLoading ? 'Booking...' : user?.role === 'professional' ? 'Only customers can book' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
