import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const courtSchema = z.object({
  clubId: z.string().min(1),
  name: z.string().min(1),
  surface: z.enum(['cristal', 'moqueta', 'cemento']).default('cristal'),
  isIndoor: z.boolean().default(false),
  pricePerHour: z.number().positive(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clubId = searchParams.get('clubId')
  if (!clubId) return NextResponse.json({ error: 'clubId requerido' }, { status: 400 })

  const courts = await prisma.court.findMany({
    where: { clubId },
    include: { schedules: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ courts })
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = courtSchema.safeParse(body)
  if (!parsed.success) {
    const messages = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
    return NextResponse.json({ error: messages || 'Datos inválidos' }, { status: 400 })
  }

  const court = await prisma.court.create({ data: parsed.data })
  return NextResponse.json({ court }, { status: 201 })
}
