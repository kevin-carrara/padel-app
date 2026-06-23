import { prisma } from '@/lib/db/prisma'
import { TimeSlot } from '@/types'

type TimeRange = { startTime: Date; endTime: Date }

export async function getAvailableSlots(courtId: string, date: string): Promise<TimeSlot[]> {
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  const [schedule, court, existingBookings, blocks] = await Promise.all([
    prisma.courtSchedule.findFirst({ where: { courtId, dayOfWeek } }),
    prisma.court.findUnique({ where: { id: courtId } }),
    prisma.booking.findMany({
      where: {
        courtId,
        status: { not: 'cancelled' },
        startTime: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.courtBlock.findMany({
      where: {
        courtId,
        startTime: { lt: new Date(`${date}T23:59:59`) },
        endTime: { gt: new Date(`${date}T00:00:00`) },
      },
      select: { startTime: true, endTime: true },
    }),
  ])
  const typedBookings = existingBookings as TimeRange[]
  const typedBlocks = blocks as TimeRange[]

  if (!schedule || !court) return []

  const slots: TimeSlot[] = []
  const [openH, openM] = schedule.openTime.split(':').map(Number)
  const [closeH, closeM] = schedule.closeTime.split(':').map(Number)
  const slotMin = schedule.slotDuration

  let currentH = openH
  let currentM = openM

  while (currentH * 60 + currentM + slotMin <= closeH * 60 + closeM) {
    const startStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`
    const endMin = currentH * 60 + currentM + slotMin
    const endH = Math.floor(endMin / 60)
    const endMins = endMin % 60
    const endStr = `${String(endH).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

    const slotStart = new Date(`${date}T${startStr}:00`)
    const slotEnd = new Date(`${date}T${endStr}:00`)

    const isBooked = typedBookings.some(
      (b: TimeRange) => b.startTime < slotEnd && b.endTime > slotStart
    )
    const isBlocked = typedBlocks.some(
      (b: TimeRange) => b.startTime < slotEnd && b.endTime > slotStart
    )

    const isPast = slotStart < new Date()

    slots.push({
      start: startStr,
      end: endStr,
      available: !isBooked && !isBlocked && !isPast,
      price: Number(court.pricePerHour) * (slotMin / 60),
    })

    currentH = endH
    currentM = endMins
  }

  return slots
}
