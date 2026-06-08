import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Professional } from '../lib/supabase'

const PROFESSIONS = ['All', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Cleaner', 'Gardener', 'AC Technician', 'Mover', 'Chef', 'Driver']

export default function Professionals() {
  const router = useRouter()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState((router.query.search as string) || '')
  const [activeProfession, setActiveProfession] = useState((router.query.profession as string) || 'All')

  const fetchPros = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (activeProfession !== 'All') params.set('profession', activeProfession)
    params.set('available', 'false')

    const res = await fetch(`/api/professionals?${params}`)
    const data = await res.json()
    setProfessionals(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPros()
  }, [activeProfession])

  useEffect(() => {
    if (router.query.search) setSearch(router.query.search as string)
    if (router.query.profession) setActiveProfession(router.query.profession as string)
  }, [router.query])

  return (
    <>
      <Head><title>Browse Professionals — SkillHire</title></Head>
      <div style={{ padding: '40px 5%', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header + Search */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Find a Professional</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Browse {professionals.length} verified professionals</p>
          <div style={{ display: 'flex', gap: 12, maxWidth: 560 }}>
            <input className="form-input" type="text" placeholder="Search by name, skill..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPros()}
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={fetchPros}>Search</button>
          </div>
        </div>

        {/* Profession filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {PROFESSIONS.map(p => (
            <button key={p} onClick={() => setActiveProfession(p)}
              className="btn btn-sm"
              style={{
                background: activeProfession === p ? 'var(--ink)' : 'white',
                color: activeProfession === p ? 'white' : 'var(--muted)',
                border: '1.5px solid',
                borderColor: activeProfession === p ? 'var(--ink)' : 'var(--border)',
              }}>
              {p}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="spinner" />
        ) : professionals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <h3>No professionals found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {professionals.map(pro => (
              <ProfCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ProfCard({ pro }: { pro: Professional }) {
  return (
    <div className="card prof-card">
      <div className="prof-card-header">
        <div className="availability-badge" style={{
          background: pro.is_available ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)',
          color: pro.is_available ? '#16a34a' : '#dc2626',
        }}>
          {pro.is_available ? '● Available' : '● Busy'}
        </div>
      </div>
      <div className="prof-avatar">
        {pro.avatar_url ? <img src={pro.avatar_url} alt={pro.name} /> : pro.name?.[0]?.toUpperCase()}
      </div>
      <div className="prof-card-body">
        <div className="prof-name">{pro.name}</div>
        <div className="prof-profession">{pro.profession}</div>
        <div className="prof-meta">
          <span>📅 {pro.experience_years}y exp</span>
          {pro.rating > 0 && <span>⭐ {pro.rating.toFixed(1)}</span>}
          <span>📋 {pro.total_bookings} jobs</span>
        </div>
        {pro.description && <p className="prof-desc">{pro.description}</p>}
        <div className="prof-footer">
          <div className="prof-rate">
            ₹{pro.hourly_rate} <span>/ hour</span>
          </div>
          <Link href={`/professionals/${pro.id}`} className="btn btn-teal btn-sm">
            View & Book
          </Link>
        </div>
      </div>
    </div>
  )
}
