'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { TennisBall, Buildings } from '@phosphor-icons/react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.6 20.1h-1.6V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" fill="#FFC107"/>
      <path d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" fill="#FF3D00"/>
      <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.5 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" fill="#4CAF50"/>
      <path d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C36.9 39.1 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" fill="#1976D2"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [step, setStep] = useState<'login' | 'select-role'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error('Credenciales incorrectas.')
    } else {
      router.push('/auth/home')
      router.refresh()
    }
  }

  async function handleGoogle(role: 'player' | 'club_admin') {
    setGoogleLoading(true)
    // Store role in cookie so the callback can read it without needing query params
    // (Supabase does exact URL matching — query params break the redirect allow-list)
    document.cookie = `intended_role=${role}; path=/; max-age=300; SameSite=Lax`
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error('No se pudo iniciar con Google.')
      setGoogleLoading(false)
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
            AJClubPadel
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
              "Gestiona tu club, a un click."
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
              AJClubPadel 
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
            AJClubPadel
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" suppressHydrationWarning>
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

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(52,37,47,0.15)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(52,37,47,0.4)', fontFamily: 'var(--font-inter)' }}>o</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(52,37,47,0.15)' }} />
          </div>

          {step === 'login' ? (
            <button
              type="button"
              onClick={() => setStep('select-role')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid rgba(52,37,47,0.2)',
                background: '#FFFFFF',
                color: '#34252F',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'var(--font-inter)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,37,47,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,37,47,0.2)' }}
            >
              <GoogleIcon />
              Continuar con Google
            </button>
          ) : (
            <div>
              <p style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(52,37,47,0.45)',
                fontFamily: 'var(--font-montserrat)',
                marginBottom: '0.75rem',
              }}>
                ¿Quién sos?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleGoogle('player')}
                  disabled={googleLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0.75rem',
                    borderRadius: '10px',
                    border: '2px solid rgba(52,37,47,0.15)',
                    background: '#FFFFFF',
                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                    opacity: googleLoading ? 0.6 : 1,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { if (!googleLoading) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#004740'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f4f3' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,37,47,0.15)'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF' }}
                >
                  <TennisBall size={32} color="#004740" weight="duotone" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>Jugador</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)', textAlign: 'center', lineHeight: 1.3 }}>Reservá canchas y jugá partidos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogle('club_admin')}
                  disabled={googleLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0.75rem',
                    borderRadius: '10px',
                    border: '2px solid rgba(52,37,47,0.15)',
                    background: '#FFFFFF',
                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                    opacity: googleLoading ? 0.6 : 1,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { if (!googleLoading) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#AE552D'; (e.currentTarget as HTMLButtonElement).style.background = '#faf4ef' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,37,47,0.15)'; (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF' }}
                >
                  <Buildings size={32} color="#AE552D" weight="duotone" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34252F', fontFamily: 'var(--font-montserrat)' }}>Admin de club</span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(52,37,47,0.5)', fontFamily: 'var(--font-inter)', textAlign: 'center', lineHeight: 1.3 }}>Gestioná tu club y canchas</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('login')}
                style={{
                  display: 'block',
                  margin: '0.75rem auto 0',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(52,37,47,0.45)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                ← Volver
              </button>
            </div>
          )}

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