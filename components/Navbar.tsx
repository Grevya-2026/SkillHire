import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface AuthUser { id: string; name: string; role: string; email: string }

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('skillhire_user')
    if (stored) setUser(JSON.parse(stored))
  }, [router.pathname])

  const logout = () => {
    localStorage.removeItem('skillhire_token')
    localStorage.removeItem('skillhire_user')
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        Skill<span>Hire</span>
      </Link>
      <div className="navbar-links">
        <Link href="/professionals">Browse Pros</Link>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            {user.role === 'professional' && (
              <Link href="/profile/edit">My Profile</Link>
            )}
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
