import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { getHomePathForRole } from '@/lib/auth/home-path'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  return NextResponse.redirect(new URL(getHomePathForRole(profile?.role), request.url))
}
