import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!profile?.clubId) return NextResponse.json({ error: 'No club found' }, { status: 400 })

    const dateParam = req.nextUrl.searchParams.get('date')

    // Parse YYYY-MM-DD purely in UTC to avoid server-local-timezone shifting
    let refDateStr: string
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      refDateStr = dateParam
    } else {
      // Today in ART (UTC-3)
      refDateStr = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
    }

    const [ry, rm, rd] = refDateStr.split('-').map(Number)
    // Use noon UTC so day-of-week is stable regardless of server timezone
    const refUtc = new Date(Date.UTC(ry, rm - 1, rd, 12))

    const dow = refUtc.getUTCDay() // 0=Sun, 1=Mon, ...
    const diffToMonday = dow === 0 ? -6 : 1 - dow

    // Week boundaries in pure UTC midnight
    const weekStart = new Date(Date.UTC(ry, rm - 1, rd + diffToMonday, 0, 0, 0, 0))
    const weekEnd   = new Date(Date.UTC(ry, rm - 1, rd + diffToMonday + 7, 0, 0, 0, 0))

    const bookings = await prisma.booking.findMany({
      where: {
        clubId: profile.clubId,
        startTime: { gte: weekStart, lt: weekEnd },
      },
      include: { court: { select: { name: true } } },
      orderBy: { startTime: 'asc' },
    })

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    const days = Array.from({ length: 7 }, (_, i) => {
      // Build each day's UTC date string directly
      const dayUtc = new Date(Date.UTC(ry, rm - 1, rd + diffToMonday + i, 12))
      const dateStr = dayUtc.toISOString().slice(0, 10)
      const dayNum  = dayUtc.getUTCDate()

      const dayBookings = bookings.filter(b => {
        // Compare using UTC ISO date string (no timezone ambiguity)
        return b.startTime.toISOString().slice(0, 10) === dateStr
      }).map(b => ({
        ...b,
        amount: Number(b.amount),
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        createdAt: b.createdAt.toISOString(),
      }))

      return {
        date: dateStr,
        label: `${dayLabels[i]} ${dayNum}`,
        bookings: dayBookings,
      }
    })

    return NextResponse.json({
      weekStart: weekStart.toISOString().slice(0, 10),
      days,
    })
  } catch (err) {
    console.error('[bookings/week]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
