import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { OnboardingForm } from './OnboardingForm'
import { TennisBall } from '@phosphor-icons/react/dist/ssr'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, nickname: true, courtPosition: true, playerLevel: true, fullName: true },
  })

  if (!profile) redirect('/login')
  if (profile.role !== 'player') redirect('/dashboard')

  const isComplete = !!(profile.nickname && profile.courtPosition && profile.playerLevel)
  if (isComplete) redirect('/jugador')

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#EBE9DF', fontFamily: 'var(--font-inter)' }}
    >
      {/* Header */}
      <header style={{
        background: '#004740',
        padding: '0 1.25rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        <span className="logo text-xl" style={{ color: '#FFFFFF' }}>AJClubPadel</span>
      </header>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 1.5rem)',
        boxSizing: 'border-box',
        width: '100%',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Encabezado */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px',
              background: '#004740',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <TennisBall size={28} color="#FFFFFF" weight="duotone" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 'clamp(1.4rem, 5vw, 1.75rem)',
              fontWeight: 800,
              color: '#34252F',
              marginBottom: '0.4rem',
            }}>
              Completá tu perfil
            </h1>
            <p style={{ color: 'rgba(52,37,47,0.55)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Solo necesitamos un par de datos para empezar
            </p>
          </div>

          <OnboardingForm defaultName={profile.fullName ?? ''} />
        </div>
      </main>
    </div>
  )
}
