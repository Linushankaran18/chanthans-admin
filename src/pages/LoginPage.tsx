import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TextField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { loginErrorMessage, googleErrorMessage } from '../utils/errors'
import { getGoogleLoginEnabled, googleLoginUrl } from '../api/auth'

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

const schema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email.'),
  password: z.string().min(1, 'Please enter your password.'),
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [googleError, setGoogleError] = useState<string | null>(() => {
    const code = searchParams.get('google_error')
    return code ? googleErrorMessage(code) : null
  })
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    if (searchParams.has('google_error')) {
      const next = new URLSearchParams(searchParams)
      next.delete('google_error')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    let active = true
    void getGoogleLoginEnabled().then((v) => { if (active) setGoogleEnabled(v) })
    return () => { active = false }
  }, [])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Values) {
    setError(null)
    setGoogleError(null)
    clearSessionMessage()
    try {
      await login(values.email, values.password)
    } catch (e) {
      setError(loginErrorMessage(e))
    }
  }

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-white lg:flex lg:flex-col lg:items-center lg:justify-center" aria-hidden>
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-cyan/15 blur-[110px]" />
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-brand-purple/15 blur-[120px]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent" />
        <div className="relative flex flex-col items-center px-12 text-center animate-fade-up">
          <img src="/logo/logo_removeback.png" alt="" className="h-60 w-60 object-contain xl:h-64 xl:w-64" />
          <h2 className="mt-4 font-display text-6xl font-light leading-none text-brand-aubergine">Chanthans</h2>
          <p className="mt-5 text-[0.72rem] font-medium uppercase tracking-[0.34em] text-ink-mute">Video &amp; Photo</p>
          <span className="brand-bar mt-6 h-px w-16" />
          <p className="mt-6 font-display text-2xl italic text-ink-soft">Capturing your moments forever</p>
        </div>
        <p className="absolute bottom-8 text-[0.65rem] uppercase tracking-[0.3em] text-muted">Studio dashboard</p>
      </aside>

      {/* Form column */}
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <img src="/logo/logo_removeback.png" alt="" className="h-14 w-14 object-contain" />
            <div>
              <p className="font-display text-3xl font-normal leading-none text-brand-aubergine">Chanthans</p>
              <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.3em] text-ink-mute">Video &amp; Photo</p>
            </div>
          </div>

          <div className="animate-fade-up">
            <p className="eyebrow">Studio Dashboard</p>
            <h1 className="mt-3 font-display text-5xl font-light leading-none text-ink">Welcome back</h1>
            <p className="mt-4 text-ink-soft">Sign in to manage your website.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-surface mt-8 space-y-5 p-6 sm:p-8">
            {sessionMessage && <Alert tone="info">{sessionMessage}</Alert>}
            {error && <Alert>{error}</Alert>}
            {googleError && <Alert>{googleError}</Alert>}
            <TextField label="Email" type="email" autoComplete="username" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-12"
              error={errors.password?.message}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-mute transition-colors hover:text-accent"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              }
              {...register('password')}
            />
            <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? 'Logging in…' : 'Login'}</Button>
          </form>

          {googleEnabled && (
            <div className="mt-6 animate-fade-up">
              <div className="flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.3em] text-ink-mute" role="separator" aria-label="or">
                <span className="h-px flex-1 bg-line-strong" />
                or
                <span className="h-px flex-1 bg-line-strong" />
              </div>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                aria-label="Continue with Google"
                onClick={() => window.location.assign(googleLoginUrl())}
              >
                <GoogleG />
                Continue with Google
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
