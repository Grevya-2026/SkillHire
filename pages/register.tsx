import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function Register() {
  const router = useRouter()
  const defaultRole = router.query.role as string || 'customer'
  const [role, setRole] = useState<'professional' | 'customer'>(defaultRole === 'professional' ? 'professional' : 'customer')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('skillhire_token', data.token)
      localStorage.setItem('skillhire_user', JSON.stringify(data.user))
      router.push(role === 'professional' ? '/profile/edit?new=true' : '/professionals')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Register — SkillHire</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--muted)' }}>Join SkillHire today</p>
          </div>

          {/* Role toggle */}
          <div style={{
            display: 'flex', background: 'var(--warm)', borderRadius: 10, padding: 4,
            marginBottom: 28, border: '1px solid var(--border)',
          }}>
            {(['customer', 'professional'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                  background: role === r ? 'white' : 'transparent',
                  color: role === r ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: 600, fontSize: '0.9rem',
                  boxShadow: role === r ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s', cursor: 'pointer',
                  textTransform: 'capitalize',
                }}>
                {r === 'customer' ? '👤 I need a Pro' : '🔧 I am a Pro'}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" required placeholder="John Smith"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required placeholder="Min. 8 characters" minLength={8}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}
                style={{ marginTop: 8, padding: '14px' }}>
                {loading ? 'Creating account...' : `Create ${role === 'customer' ? 'Customer' : 'Professional'} Account`}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--muted)' }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
