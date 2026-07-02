import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { CourtPosition, PlayerLevel } from '@prisma/client'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { nickname, courtPosition, playerLevel } = body

  if (!nickname || !courtPosition || !playerLevel) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const validPositions = Object.values(CourtPosition)
  const validLevels = Object.values(PlayerLevel)

  if (!validPositions.includes(courtPosition) || !validLevels.includes(playerLevel)) {
    return NextResponse.json({ error: 'Invalid values' }, { status: 400 })
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      nickname,
      phone: body.phone ?? null,
      courtPosition,
      playerLevel,
    },
  })

  return NextResponse.json({ ok: true })
}
