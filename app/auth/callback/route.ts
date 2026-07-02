import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { getHomePathForRole } from '@/lib/auth/home-path'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth callback error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Check if profile already exists
  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  })

  if (existingProfile) {
    return NextResponse.redirect(`${origin}${getHomePathForRole(existingProfile.role)}`)
  }

  // New user — read intended role from cookie (set before OAuth redirect)
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get('intended_role')?.value
  const role = roleCookie === 'club_admin' ? 'club_admin' : 'player'

  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
  const avatarUrl = user.user_metadata?.avatar_url ?? null

  await prisma.profile.create({
    data: {
      id: user.id,
      role,
      fullName,
      avatarUrl,
    },
  })

  const destination = role === 'player' ? '/jugador?onboarding=1' : `${getHomePathForRole(role)}?onboarding=1`
  return NextResponse.redirect(`${origin}${destination}`)
}
