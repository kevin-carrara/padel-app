import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(30).max(180).default(60),
})
const bodySchema = z.object({ schedules: z.array(scheduleItemSchema).min(1) })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params
  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.courtSchedule.deleteMany({ where: { courtId } }),
    prisma.courtSchedule.createMany({
      data: parsed.data.schedules.map(s => ({ ...s, courtId })),
    }),
  ])

  const schedules = await prisma.courtSchedule.findMany({ where: { courtId } })
  return NextResponse.json({ schedules })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params
  await prisma.courtSchedule.deleteMany({ where: { courtId } })
  return NextResponse.json({ ok: true })
}