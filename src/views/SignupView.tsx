import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api/endpoints'
import { useAuthStore } from '../store/authStore'

export function SignupView() {
  const [companyName, setCompanyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setTokens = useAuthStore((s) => s.setTokens)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authApi.createCompany({
        company_name: companyName,
        admin_name: name,
        admin_email: email,
        admin_password: password,
      })
      setTokens(result.access_token, result.refresh_token)
      setUser(result.user)
      navigate('/onboarding')
    } catch {
      setError('Signup failed. Company signup may be disabled or email already exists.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl border border-mist bg-white p-8 shadow-sm">
        <Link to="/" className="text-sm text-graphite hover:text-ink">← Back</Link>
        <h1 className="mt-4 text-2xl font-semibold text-ink">Create your company Brain</h1>
        <p className="mt-2 text-sm text-graphite">Set up in under 10 minutes. No credit card required.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full rounded-lg border border-mist px-4 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-mist px-4 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-mist px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            placeholder="Password (min 12 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            className="w-full rounded-lg border border-mist px-4 py-2.5 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white hover:bg-graphite disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite">
          Already have an account?{' '}
          <Link to="/login" className="text-ink underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
