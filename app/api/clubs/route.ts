import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const onlyActive = searchParams.get('active') === 'true'

  const clubs = await prisma.club.findMany({
    where: onlyActive
      ? { subscriptionStatus: { in: ['active', 'trial'] } }
      : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      phone: true,
      logoUrl: true,
      subscriptionStatus: true,
      courts: {
        where: { isActive: true },
        select: { id: true, name: true, isActive: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ clubs })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, slug, address, phone } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'name y slug son requeridos' }, { status: 400 })
  }

  const club = await prisma.club.create({
    data: {
      name,
      slug,
      address,
      phone,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.json({ club }, { status: 201 })
}
