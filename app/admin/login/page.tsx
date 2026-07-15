'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-abyss px-6">
      <form
        onSubmit={submit}
        className="glass glass-glow w-full max-w-sm rounded-3xl p-8"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-primary">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-2xl text-foreground">Sign in</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mt-6 w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none focus:border-primary/50"
        />
        {error && <p className="mt-3 text-sm text-[#FB7185]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary/20 px-6 py-3 text-sm font-medium text-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  )
}
