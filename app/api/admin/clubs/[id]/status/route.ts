import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

const VALID_STATUSES = ['pending', 'active', 'trial', 'inactive', 'suspended'] as const
type Status = (typeof VALID_STATUSES)[number]

export async function PATCH(
  req: NextRequest,
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
  const body = await req.json()
  const { status, trialEndsAt } = body

  if (!VALID_STATUSES.includes(status as Status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.club.update({
    where: { id },
    data: {
      subscriptionStatus: status as Status,
      ...(trialEndsAt ? { trialEndsAt: new Date(trialEndsAt) } : {}),
    },
    select: { id: true, name: true, subscriptionStatus: true, trialEndsAt: true },
  })

  return NextResponse.json(updated)
}
