import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NYLAS_CLIENT_ID = process.env.NYLAS_CLIENT_ID!
const NYLAS_API_URI = process.env.NYLAS_API_URI!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  const redirectUri = `${APP_URL}/api/calendar/nylas/callback`

  const params = new URLSearchParams({
    client_id: NYLAS_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
  })

  const authUrl = `${NYLAS_API_URI}/v3/connect/auth?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
