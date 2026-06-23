import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })

  let existingClubId: string | undefined
  let existingClubName: string | undefined

  if (profile?.clubId) {
    const club = await prisma.club.findUnique({
      where: { id: profile.clubId },
      include: {
        courts: {
          include: { schedules: true },
        },
      },
    })

    if (club) {
      const hasCourts = club.courts.length > 0
      const hasSchedules = club.courts.some(c => c.schedules.length > 0)
      if (hasCourts && hasSchedules) {
        redirect('/dashboard')
      }
      existingClubId = club.id
      existingClubName = club.name
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="section-label">Configuración inicial</div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', fontWeight: 700, color: '#34252F' }}>
          Bienvenido a PadelBook
        </h1>
      </div>
      <OnboardingWizard
        userId={user.id}
        existingClubId={existingClubId}
        existingClubName={existingClubName}
      />
    </div>
  )
}