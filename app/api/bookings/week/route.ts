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
    const refDate = dateParam ? new Date(dateParam) : new Date()

    // Compute Monday of the week containing refDate
    const day = refDate.getDay() // 0=Sun, 1=Mon, ...
    const diffToMonday = (day === 0 ? -6 : 1 - day)
    const weekStart = new Date(refDate)
    weekStart.setDate(refDate.getDate() + diffToMonday)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

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
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.startTime).toISOString().split('T')[0]
        return bDate === dateStr
      }).map(b => ({
        ...b,
        amount: Number(b.amount),
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        createdAt: b.createdAt.toISOString(),
      }))

      return {
        date: dateStr,
        label: `${dayLabels[i]} ${d.getDate()}`,
        bookings: dayBookings,
      }
    })

    return NextResponse.json({
      weekStart: weekStart.toISOString().split('T')[0],
      days,
    })
  } catch (err) {
    console.error('[bookings/week]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
