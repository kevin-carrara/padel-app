import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const schema = z.object({
  bookingId: z.string().min(1),
  weeks: z.number().int().min(1).max(52),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { bookingId, weeks } = parsed.data

    const source = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { court: { select: { clubId: true, isActive: true, pricePerHour: true } } },
    })

    if (!source) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

    // Verify user owns this club
    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (profile?.clubId !== source.court.clubId) {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
    }

    const created: string[] = []
    const skipped: string[] = [] // dates with conflicts

    for (let w = 1; w <= weeks; w++) {
      const start = new Date(source.startTime)
      start.setDate(start.getDate() + w * 7)
      const end = new Date(source.endTime)
      end.setDate(end.getDate() + w * 7)

      // Check overlap
      const overlap = await prisma.booking.findFirst({
        where: {
          courtId: source.courtId,
          status: { not: 'cancelled' },
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      })

      if (overlap) {
        skipped.push(start.toISOString().split('T')[0])
        continue
      }

      try {
        const b = await prisma.booking.create({
          data: {
            clubId: source.clubId,
            courtId: source.courtId,
            playerId: source.playerId,
            playerName: source.playerName,
            playerPhone: source.playerPhone,
            startTime: start,
            endTime: end,
            durationMin: source.durationMin,
            amount: source.amount,
            notes: source.notes,
            createdById: user.id,
          },
        })
        created.push(b.id)
      } catch {
        skipped.push(start.toISOString().split('T')[0])
      }
    }

    return NextResponse.json({ created: created.length, skipped })
  } catch (err) {
    console.error('[bookings/repeat]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
