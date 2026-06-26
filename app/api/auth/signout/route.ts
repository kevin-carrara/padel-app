import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url))
}

// Keep GET for backward compatibility but don't prefetch-trigger signout
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}