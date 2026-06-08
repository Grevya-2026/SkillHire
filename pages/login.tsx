import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('skillhire_token', data.token)
      localStorage.setItem('skillhire_user', JSON.stringify(data.user))
      if (data.user.role === 'professional' && !data.profileId) {
        router.push('/profile/edit?new=true')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head><title>Login — SkillHire</title></Head>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Welcome Back</h1>
            <p style={{ color: 'var(--muted)' }}>Login to your SkillHire account</p>
          </div>
          <div className="card" style={{ padding: 32 }}>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}
                style={{ marginTop: 8, padding: '14px' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.9rem', color: 'var(--muted)' }}>
              New here? <Link href="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
