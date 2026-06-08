import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

const professions = [
  { icon: '🔧', name: 'Plumber' },
  { icon: '⚡', name: 'Electrician' },
  { icon: '🎨', name: 'Painter' },
  { icon: '🏗️', name: 'Carpenter' },
  { icon: '🧹', name: 'Cleaner' },
  { icon: '🌿', name: 'Gardener' },
  { icon: '❄️', name: 'AC Technician' },
  { icon: '📦', name: 'Mover' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const router_push = (q: string) => {
    window.location.href = `/professionals?search=${encodeURIComponent(q)}`
  }

  return (
    <>
      <Head>
        <title>SkillHire — Find & Book Local Professionals</title>
        <meta name="description" content="Book trusted local professionals for any job. Plumbers, electricians, cleaners, and more." />
      </Head>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #2a6b6e 60%, #0f0f0f 100%)',
        padding: '100px 5% 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0L80 12v2L54 40h-2zm4 0L80 16v2L58 40h-2zm4 0L80 20v2L62 40h-2zm4 0L80 24v2L66 40h-2zm4 0L80 28v2L70 40h-2zm4 0L80 32v2L74 40h-2zm4 0L80 36v2L78 40h-2zm4 0L80 40v-2h-2l2-2v2h-2l2 2v-2h2v2zm-2 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201, 168, 76, 0.15)', border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 24,
            color: '#e8c97a', fontSize: '0.85rem', fontWeight: 600,
          }}>
            ✦ Trusted by 10,000+ customers
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'white', marginBottom: 20, maxWidth: 800, margin: '0 auto 20px' }}>
            Find the Perfect<br />
            <span style={{ color: '#c9a84c' }}>Professional</span> for Any Job
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Browse profiles, watch intro videos, and book verified professionals in your area — all in minutes.
          </p>

          {/* Search bar */}
          <div style={{
            display: 'flex', gap: 0, maxWidth: 560, margin: '0 auto 48px',
            background: 'white', borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          }}>
            <input
              type="text"
              placeholder="Search plumber, electrician, cleaner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && router_push(search)}
              style={{
                flex: 1, padding: '16px 20px', border: 'none', fontSize: '0.95rem',
                outline: 'none', background: 'transparent',
              }}
            />
            <button
              onClick={() => router_push(search)}
              className="btn btn-gold"
              style={{ borderRadius: 0, padding: '0 28px', fontSize: '1rem' }}
            >
              Search
            </button>
          </div>

          {/* Quick categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {professions.map(p => (
              <a key={p.name} href={`/professionals?profession=${p.name}`}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                {p.icon} {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 5%', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>How It Works</p>
            <h2 style={{ fontSize: '2.2rem' }}>Book a Pro in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-3" style={{ maxWidth: 900, margin: '0 auto' }}>
            {[
              { step: '01', title: 'Browse Profiles', desc: 'Explore professionals by skill. View their experience, rates, and intro videos.' },
              { step: '02', title: 'Choose & Book', desc: 'Select hours, confirm the rate, and schedule at a time that works for you.' },
              { step: '03', title: 'Get It Done', desc: 'Your professional arrives, completes the job. Simple, reliable, transparent.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal), var(--ink))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: 'white',
                  fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700,
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', background: 'var(--cream)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Are You a Professional?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Join thousands of skilled professionals already growing their business on SkillHire.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=professional" className="btn btn-primary btn-lg">
              Register as Professional
            </Link>
            <Link href="/professionals" className="btn btn-outline btn-lg">
              Browse Professionals
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
