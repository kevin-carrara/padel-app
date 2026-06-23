import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  pricePerHour: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  isIndoor: z.boolean().optional(),
  surface: z.enum(['cristal', 'moqueta', 'cemento']).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const court = await prisma.court.update({
    where: { id: courtId },
    data: parsed.data,
  })

  return NextResponse.json({ court })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    include: { schedules: true },
  })
  if (!court) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json({ court })
}
