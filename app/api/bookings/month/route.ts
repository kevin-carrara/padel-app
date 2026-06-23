import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile?.clubId) return NextResponse.json({ error: 'No club' }, { status: 400 })

    const year = parseInt(req.nextUrl.searchParams.get('year') ?? '2026')
    const month = parseInt(req.nextUrl.searchParams.get('month') ?? '1') // 1-12

    // ART midnight of first/last day of month (UTC = ART + 3h)
    const startISO = `${year}-${String(month).padStart(2,'0')}-01T03:00:00.000Z`
    const nm = month === 12 ? 1 : month + 1
    const ny = month === 12 ? year + 1 : year
    const endISO = `${ny}-${String(nm).padStart(2,'0')}-01T03:00:00.000Z`

    const bookings = await prisma.booking.findMany({
      where: {
        clubId: profile.clubId,
        startTime: { gte: new Date(startISO), lt: new Date(endISO) },
      },
      select: {
        id: true,
        playerName: true,
        startTime: true,
        status: true,
        court: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    // Group by ART date (UTC - 3h)
    const byDate: Record<string, {
      count: number
      bookings: { id: string; playerName: string; startTime: string; status: string; courtName: string }[]
    }> = {}

    for (const b of bookings) {
      const artMs = b.startTime.getTime() - 180 * 60 * 1000
      const artDateStr = new Date(artMs).toISOString().slice(0, 10)
      if (!byDate[artDateStr]) byDate[artDateStr] = { count: 0, bookings: [] }
      byDate[artDateStr].count++
      byDate[artDateStr].bookings.push({
        id: b.id,
        playerName: b.playerName,
        startTime: b.startTime.toISOString(),
        status: b.status,
        courtName: b.court.name,
      })
    }

    return NextResponse.json({ year, month, byDate })
  } catch (err) {
    console.error('[bookings/month]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}