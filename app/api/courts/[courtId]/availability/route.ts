import { NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/booking/availability'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date requerido (YYYY-MM-DD)' }, { status: 400 })
  }

  const slots = await getAvailableSlots(courtId, date)
  return NextResponse.json({ slots })
}
