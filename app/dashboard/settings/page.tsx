import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import ClubSettingsForm from './ClubSettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { clubId: true, role: true },
  })
  if (!profile?.clubId) redirect('/dashboard')

  const club = await prisma.club.findUnique({
    where: { id: profile.clubId },
    select: {
      id: true, name: true, slug: true, address: true, phone: true,
      description: true, coverUrl: true, amenities: true, subscriptionStatus: true,
    },
  })
  if (!club) redirect('/dashboard')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: '#AE552D', fontFamily: 'var(--font-montserrat)',
          marginBottom: '0.35rem',
        }}>
          Configuración
        </p>
        <h1 style={{
          fontFamily: 'var(--font-montserrat)', fontSize: '2rem', fontWeight: 800,
          color: '#34252F', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          Mi club
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.5)', marginTop: '0.4rem' }}>
          Esta información aparece en tu página pública para los jugadores.
        </p>
      </div>

      <ClubSettingsForm club={club} />
    </div>
  )
}
