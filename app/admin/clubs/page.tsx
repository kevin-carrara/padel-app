import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db/prisma'
import ClubsTable from './ClubsTable'

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'superadmin') redirect('/dashboard')

  const clubs = await prisma.club.findMany({
    include: {
      _count: { select: { courts: true, bookings: true } },
      profiles: {
        where: { role: 'club_admin' },
        select: { fullName: true, phone: true, id: true },
        take: 1,
      },
    },
    orderBy: [
      { subscriptionStatus: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  // Obtener emails de los admins desde Supabase Auth
  const adminIds = clubs.flatMap(c => c.profiles.map(p => p.id))
  let emailMap: Record<string, string> = {}
  if (adminIds.length > 0) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (usersData?.users) {
      emailMap = Object.fromEntries(
        usersData.users
          .filter(u => adminIds.includes(u.id))
          .map(u => [u.id, u.email ?? ''])
      )
    }
  }

  // Revenue por club
  const revenueByClub = await prisma.booking.groupBy({
    by: ['clubId'],
    where: { paymentStatus: 'paid' },
    _sum: { amount: true },
  })
  const revenueMap = Object.fromEntries(revenueByClub.map(r => [r.clubId, Number(r._sum.amount ?? 0)]))

  const STATUS_ORDER: Record<string, number> = { pending: 0, trial: 1, active: 2, inactive: 3, suspended: 4 }

  const clubsData = clubs.map(c => {
    const admin = c.profiles[0] ?? null
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      address: c.address,
      phone: c.phone,
      subscriptionStatus: c.subscriptionStatus,
      trialEndsAt: c.trialEndsAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      _count: c._count,
      _revenue: revenueMap[c.id] ?? 0,
      admin: admin ? {
        id: admin.id,
        fullName: admin.fullName,
        phone: admin.phone,
        email: emailMap[admin.id] ?? null,
      } : null,
    }
  }).sort((a, b) => {
    const orderA = STATUS_ORDER[a.subscriptionStatus] ?? 99
    const orderB = STATUS_ORDER[b.subscriptionStatus] ?? 99
    if (orderA !== orderB) return orderA - orderB
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: '#AE552D', fontFamily: 'var(--font-montserrat)',
          marginBottom: '0.35rem',
        }}>
          Panel de administracion
        </p>
        <h1 style={{
          fontFamily: 'var(--font-montserrat)', fontSize: '2rem', fontWeight: 800,
          color: '#34252F', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          Clubes
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(52,37,47,0.5)', marginTop: '0.4rem' }}>
          Gestiona suscripciones y monitorea el estado de todos los clubes.
        </p>
      </div>

      <ClubsTable clubs={clubsData} />
    </>
  )
}