import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { TennisBall, HandWaving } from '@phosphor-icons/react/dist/ssr'
import { ActionGrid } from './ActionGrid'

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
    select: { id: true, fullName: true, nickname: true, avatarUrl: true, role: true, courtPosition: true, playerLevel: true },
  })

  if (!profile) redirect('/login')
  if (profile.role !== 'player') redirect('/dashboard')

  const isComplete = !!(profile.nickname && profile.courtPosition && profile.playerLevel)
  if (!isComplete) redirect('/jugador/onboarding')

  const params = await searchParams
  const isOnboarding = params.onboarding === '1'
  const firstName = profile.nickname ?? profile.fullName?.split(' ')[0] ?? 'Jugador'

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
        <ActionGrid />

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
