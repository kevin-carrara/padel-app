import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createBookingSchema = z.object({
  courtId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  playerName: z.string().min(2),
  playerPhone: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createBookingSchema.safeParse(body)

  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
    return NextResponse.json({ error: messages || 'Datos inválidos' }, { status: 400 })
  }

  const { courtId, startTime, endTime, playerName, playerPhone, notes } = parsed.data

  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { club: true },
  })

  if (!court || !court.isActive) {
    return NextResponse.json({ error: 'Cancha no encontrada' }, { status: 404 })
  }

  if (court.club.subscriptionStatus === 'inactive' || court.club.subscriptionStatus === 'suspended') {
    return NextResponse.json({ error: 'Club sin suscripción activa' }, { status: 403 })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)
  const durationMin = Math.round((end.getTime() - start.getTime()) / 60000)
  const amount = Number(court.pricePerHour) * (durationMin / 60)

  // Check for overlap before insert (DB constraint is the ultimate guard)
  const overlap = await prisma.booking.findFirst({
    where: {
      courtId,
      status: { not: 'cancelled' },
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  })

  if (overlap) {
    return NextResponse.json({ error: 'Turno ocupado. Elegí otro horario.' }, { status: 409 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const booking = await prisma.booking.create({
      data: {
        clubId: court.clubId,
        courtId,
        playerId: user?.id ?? null,
        playerName,
        playerPhone,
        startTime: start,
        endTime: end,
        durationMin,
        amount,
        notes,
        createdById: user?.id ?? null,
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: unknown) {
    // PostgreSQL unique constraint violation
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Turno ocupado. Elegí otro horario.' }, { status: 409 })
    }
    throw error
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')
  const date = searchParams.get('date')
  const status = searchParams.get('status')

  if (!clubId) {
    return NextResponse.json({ error: 'clubId requerido' }, { status: 400 })
  }

  const where: Record<string, unknown> = { clubId }
  if (status) where.status = status
  if (date) {
    where.startTime = {
      gte: new Date(`${date}T00:00:00`),
      lt: new Date(`${date}T23:59:59`),
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      court: { select: { name: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  return NextResponse.json({ bookings })
}
