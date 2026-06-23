import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { canCancel } from '@/lib/booking/rules'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const body = await request.json()
  const { status, cancelReason, paymentStatus, paymentMethod } = body

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  if (status === 'cancelled') {
    if (!canCancel(booking.startTime)) {
      return NextResponse.json(
        { error: 'No se puede cancelar con menos de 2 horas de anticipación' },
        { status: 422 }
      )
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: cancelReason ?? null,
      },
    })
    return NextResponse.json({ booking: updated })
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(paymentStatus && { paymentStatus }),
      ...(paymentMethod && { paymentMethod }),
    },
  })

  return NextResponse.json({ booking: updated })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      court: { select: { name: true, pricePerHour: true } },
      club: { select: { name: true, slug: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
