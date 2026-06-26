import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const VALID_AMENITIES = [
  'bar', 'showers', 'tv', 'free_water', 'parking', 'wifi',
  'locker_room', 'pro_shop', 'coaching', 'lighting', 'vestuarios',
] as const

type ValidAmenity = (typeof VALID_AMENITIES)[number]

const schema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  coverUrl: z.string().url().optional().nullable().or(z.literal('')),
  // Filtra silenciosamente cualquier valor desconocido
  amenities: z.array(z.string()).default([]).transform(arr =>
    arr.filter((a): a is ValidAmenity => (VALID_AMENITIES as readonly string[]).includes(a))
  ),
})

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { clubId: true, role: true },
  })
  if (!profile?.clubId || (profile.role !== 'club_admin' && profile.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, address, phone, description, coverUrl, amenities } = parsed.data

  const updated = await prisma.club.update({
    where: { id: profile.clubId },
    data: {
      name,
      address: address || null,
      phone: phone || null,
      description: description || null,
      coverUrl: coverUrl || null,
      amenities,
    },
    select: {
      id: true, name: true, address: true, phone: true,
      description: true, coverUrl: true, amenities: true,
    },
  })

  return NextResponse.json(updated)
}
