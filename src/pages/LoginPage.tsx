import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { TextField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { loginErrorMessage } from '../utils/errors'

const schema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email.'),
  password: z.string().min(1, 'Please enter your password.'),
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { login, sessionMessage, clearSessionMessage } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  async function onSubmit(values: Values) {
    setError(null)
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
        </div>
      </main>
    </div>
  )
}
