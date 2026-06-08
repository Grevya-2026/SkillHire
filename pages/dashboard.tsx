import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Booking } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const stored = localStorage.getItem('skillhire_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const token = localStorage.getItem('skillhire_token')
    const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('skillhire_token')
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchBookings()
  }

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab)
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.total_amount, 0),
  }

  if (!user) return null

  return (
    <>
      <Head><title>Dashboard — SkillHire</title></Head>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Welcome, {user.name}</h1>
            <p style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{user.role} Dashboard</p>
          </div>
          {user.role === 'professional' && (
            <Link href="/profile/edit" className="btn btn-primary">Edit Profile</Link>
          )}
          {user.role === 'customer' && (
            <Link href="/professionals" className="btn btn-teal">Book a Professional</Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Bookings', value: stats.total, icon: '📋' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'Confirmed', value: stats.confirmed, icon: '✅' },
            { label: user.role === 'professional' ? 'Revenue (₹)' : 'Spent (₹)', value: `₹${stats.revenue.toFixed(0)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '20px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="card">
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="btn btn-sm"
                style={{
                  background: activeTab === tab ? 'var(--ink)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--muted)',
                  border: '1.5px solid',
                  borderColor: activeTab === tab ? 'var(--ink)' : 'var(--border)',
                  textTransform: 'capitalize',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="spinner" />
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p>No {activeTab === 'all' ? '' : activeTab} bookings yet</p>
            </div>
          ) : (
            <div>
              {filtered.map(b => (
                <BookingRow key={b.id} booking={b} userRole={user.role} onUpdate={updateStatus} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function BookingRow({ booking: b, userRole, onUpdate }: { booking: any, userRole: string, onUpdate: (id: string, status: string) => void }) {
  const date = new Date(b.scheduled_date)
  const isProf = userRole === 'professional'

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {isProf ? `Customer Booking` : `${b.professionals?.name || 'Professional'} — ${b.professionals?.profession}`}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          {' at '}
          {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: '0.85rem', marginTop: 4, color: 'var(--muted)' }}>
          {b.hours}h × ₹{b.rate_per_hour}/hr = <strong style={{ color: 'var(--ink)' }}>₹{b.total_amount}</strong>
        </div>
        {b.notes && <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>{b.notes}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={`badge badge-${b.status}`}>{b.status}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {isProf && b.status === 'pending' && (
            <>
              <button className="btn btn-sm btn-teal" onClick={() => onUpdate(b.id, 'confirmed')}>Confirm</button>
              <button className="btn btn-sm btn-danger" onClick={() => onUpdate(b.id, 'cancelled')}>Decline</button>
            </>
          )}
          {isProf && b.status === 'confirmed' && (
            <button className="btn btn-sm btn-primary" onClick={() => onUpdate(b.id, 'completed')}>Mark Done</button>
          )}
          {!isProf && b.status === 'pending' && (
            <button className="btn btn-sm btn-danger" onClick={() => onUpdate(b.id, 'cancelled')}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  )
}
