import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  // Get all profile IDs linked to this club
  const profiles = await prisma.profile.findMany({
    where: { clubId: id },
    select: { id: true },
  })

  // Delete club (cascades: courts, bookings, court_blocks, court_schedules, profiles)
  await prisma.club.delete({ where: { id } })

  // Delete auth users from Supabase
  if (profiles.length > 0) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await Promise.allSettled(
      profiles.map(p => supabaseAdmin.auth.admin.deleteUser(p.id))
    )
  }

  return NextResponse.json({ ok: true })
}
