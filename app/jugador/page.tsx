import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import {
  TennisBall,
  Buildings,
  Lightning,
  CalendarBlank,
  UserCircle,
  HandWaving,
} from '@phosphor-icons/react/dist/ssr'

export default async function JugadorPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, fullName: true, avatarUrl: true, role: true },
  })

  if (!profile) redirect('/login')
  if (profile.role !== 'player') redirect('/dashboard')

  const params = await searchParams
  const isOnboarding = params.onboarding === '1'
  const firstName = profile.fullName?.split(' ')[0] ?? 'Jugador'

  return (
    <div
      className="min-h-screen"
      style={{ background: '#EBE9DF', fontFamily: 'var(--font-inter)', overflowX: 'hidden', boxSizing: 'border-box' }}
    >
      {/* Header */}
      <header
        style={{
          background: '#004740',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 1.25rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <span className="logo text-xl" style={{ color: '#FFFFFF' }}>
          AJClubPadel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          {profile.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.fullName ?? 'avatar'}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <span style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '0.8rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '140px',
          }}>
            {profile.fullName ?? user.email}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(1.25rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.5rem)', boxSizing: 'border-box', width: '100%' }}>
        {/* Welcome banner */}
        {isOnboarding && (
          <div
            style={{
              background: 'rgba(0,71,64,0.08)',
              border: '1.5px solid rgba(0,71,64,0.2)',
              borderRadius: '12px',
              padding: '0.875rem 1.125rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <TennisBall size={22} color="#004740" weight="duotone" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, color: '#004740', fontSize: '0.9rem', marginBottom: '0.15rem', wordBreak: 'break-word' }}>
                ¡Bienvenido a AJClubPadel, {firstName}!
              </p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(52,37,47,0.6)', lineHeight: 1.4 }}>
                Tu cuenta de jugador está lista. Explorá los clubes y reservá tu primera cancha.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
              fontWeight: 800,
              color: '#34252F',
              margin: 0,
            }}
          >
            Hola, {firstName}
          </h1>
          <HandWaving size={26} color="#AE552D" weight="duotone" />
        </div>
        <p style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem', marginTop: '0.2rem' }}>
          ¿Qué querés hacer hoy?
        </p>

        {/* Actions grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
          <Link
            href="/clubes"
            style={{
              background: '#004740',
              borderRadius: '12px',
              padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.25rem)',
              textDecoration: 'none',
              display: 'block',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Buildings size={28} color="rgba(255,255,255,0.9)" weight="duotone" style={{ display: 'block', marginBottom: '0.6rem' }} />
            <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
              Ver clubes
            </p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)', lineHeight: 1.3 }}>
              Explorá y reservá canchas
            </p>
          </Link>

          <div
            style={{
              background: 'rgba(52,37,47,0.06)',
              borderRadius: '12px',
              padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.25rem)',
              border: '1.5px dashed rgba(52,37,47,0.15)',
              cursor: 'default',
              opacity: 0.7,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Lightning size={28} color="#34252F" weight="duotone" style={{ display: 'block', marginBottom: '0.6rem' }} />
            <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
              Partidos abiertos
            </p>
            <p style={{ color: 'rgba(52,37,47,0.45)', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>
              Próximamente
            </p>
          </div>

          <div
            style={{
              background: 'rgba(52,37,47,0.06)',
              borderRadius: '12px',
              padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.25rem)',
              border: '1.5px dashed rgba(52,37,47,0.15)',
              cursor: 'default',
              opacity: 0.7,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <CalendarBlank size={28} color="#34252F" weight="duotone" style={{ display: 'block', marginBottom: '0.6rem' }} />
            <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
              Mis reservas
            </p>
            <p style={{ color: 'rgba(52,37,47,0.45)', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>
              Próximamente
            </p>
          </div>

          <div
            style={{
              background: 'rgba(52,37,47,0.06)',
              borderRadius: '12px',
              padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.25rem)',
              border: '1.5px dashed rgba(52,37,47,0.15)',
              cursor: 'default',
              opacity: 0.7,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <UserCircle size={28} color="#34252F" weight="duotone" style={{ display: 'block', marginBottom: '0.6rem' }} />
            <p style={{ color: '#34252F', fontWeight: 700, fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', marginBottom: '0.2rem' }}>
              Mi perfil
            </p>
            <p style={{ color: 'rgba(52,37,47,0.45)', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)' }}>
              Próximamente
            </p>
          </div>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(52,37,47,0.45)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-inter)',
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </main>
    </div>
  )
}
