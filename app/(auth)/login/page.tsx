'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error('Credenciales incorrectas.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] relative overflow-hidden"
        style={{ background: '#004740' }}
      >
        {/* Net pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 28px)',
          }}
        />

        <div className="relative z-10 p-10">
          <Link href="/" className="logo text-2xl" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
            PadelBook
          </Link>
        </div>

        <div className="relative z-10 p-10 pb-16">
          <blockquote>
            <p
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.5rem',
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#FFFFFF',
                lineHeight: 1.35,
                marginBottom: '1rem',
              }}
            >
              "La cancha perfecta, a un clic."
            </p>
            <footer
              style={{
                color: '#AE552D',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-montserrat)',
              }}
            >
              PadelBook · Monte Cristo
            </footer>
          </blockquote>
        </div>

        {/* Cognac circle accent */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 rounded-tl-full"
          style={{ background: '#AE552D', opacity: 0.15 }}
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-16" style={{ background: '#EBE9DF' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="logo text-2xl block mb-10 lg:hidden" style={{ color: '#004740', textDecoration: 'none' }}>
            PadelBook
          </Link>

          <div className="mb-8">
            <h1
              style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '1.875rem',
                fontWeight: 800,
                color: '#34252F',
                letterSpacing: '-0.02em',
                marginBottom: '0.25rem',
              }}
            >
              Bienvenido de vuelta
            </h1>
            <p style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.9rem', fontFamily: 'var(--font-inter)' }}>
              Ingresa con tu cuenta del club
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg mt-2">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(52,37,47,0.55)', fontFamily: 'var(--font-inter)' }}>
            ¿No tenes cuenta?{' '}
            <Link href="/register" style={{ color: '#AE552D', fontWeight: 600, textDecoration: 'none' }}>
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}