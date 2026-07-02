import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { ProfileView } from './ProfileView'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      fullName: true,
      nickname: true,
      avatarUrl: true,
      phone: true,
      courtPosition: true,
      playerLevel: true,
      role: true,
      createdAt: true,
    },
  })

  if (!profile) redirect('/login')
  if (profile.role !== 'player') redirect('/dashboard')

  return <ProfileView profile={profile} email={user.email ?? ''} />
}
