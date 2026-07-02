import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { CourtPosition, PlayerLevel } from '@prisma/client'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nickname, phone, courtPosition, playerLevel } = await request.json()

  if (!nickname?.trim()) return NextResponse.json({ error: 'Missing nickname' }, { status: 400 })
  if (!Object.values(CourtPosition).includes(courtPosition)) return NextResponse.json({ error: 'Invalid position' }, { status: 400 })
  if (!Object.values(PlayerLevel).includes(playerLevel)) return NextResponse.json({ error: 'Invalid level' }, { status: 400 })

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      nickname: nickname.trim(),
      phone: phone?.trim() || null,
      courtPosition,
      playerLevel,
    },
  })

  return NextResponse.json({ ok: true })
}
