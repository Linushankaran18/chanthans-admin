import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// A dashboard JWT is three base64url segments.
const JWT_SHAPE = /^[\w-]+\.[\w-]+\.[\w-]+$/

export default function GoogleCompletePage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const token = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token')
    // Remove the token from the address bar / history immediately.
    window.history.replaceState(null, '', window.location.pathname)
    if (token && JWT_SHAPE.test(token)) {
      loginWithToken(token)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login?google_error=exchange_failed', { replace: true })
    }
  }, [loginWithToken, navigate])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 text-center" role="status" aria-live="polite">
      <img src="/logo/logo_removeback.png" alt="" className="h-20 w-20 object-contain" />
      <p className="mt-4 font-display text-3xl font-light text-brand-aubergine">Chanthans</p>
      <span className="brand-bar mt-5 h-px w-16" />
      <p className="mt-6 flex items-center gap-2 text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Signing you in…
      </p>
    </main>
  )
}
