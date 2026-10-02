import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white">
            <Camera className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold">Photography Studio</h1>
          <p className="mt-2 text-sm text-ink-soft">Sign in to manage your website.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-2xl border border-paper-line bg-white p-6 shadow-sm sm:p-8">
          {sessionMessage && <Alert tone="info">{sessionMessage}</Alert>}
          {error && <Alert>{error}</Alert>}
          <TextField label="Email" type="email" autoComplete="username" error={errors.email?.message} {...register('email')} />
          <TextField label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
          <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? 'Logging in…' : 'Login'}</Button>
        </form>
      </div>
    </div>
  )
}
