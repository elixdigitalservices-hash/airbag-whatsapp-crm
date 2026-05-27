'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Email o contraseña incorrectos')
        setLoading(false)
      }
      return
    }

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {isDemo && (
          <div className="mb-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl px-4 py-3 text-sm text-orange-300">
            <p className="font-semibold mb-1 text-orange-400">Modo demo</p>
            <p>Email: <span className="font-mono text-orange-300">admin@airbag.com</span></p>
            <p>Contraseña: <span className="font-mono text-orange-300">airbag2025</span></p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-orange-500/30">
              A
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Airbag CRM</h1>
            <p className="text-slate-400 mt-1 text-sm">Panel de gestión · Autoescuela Airbag</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-slate-50 transition"
                placeholder="admin@airbag.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-slate-50 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40"
            >
              {loading ? 'Entrando...' : 'Entrar al panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Autoescuela Airbag · Tomares, Sevilla
        </p>
      </div>
    </div>
  )
}
