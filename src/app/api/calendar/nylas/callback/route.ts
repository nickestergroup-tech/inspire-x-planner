import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NYLAS_API_KEY = process.env.NYLAS_API_KEY!
const NYLAS_CLIENT_ID = process.env.NYLAS_CLIENT_ID!
const NYLAS_API_URI = process.env.NYLAS_API_URI!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/settings?error=calendar_auth_failed`)
  }

  const redirectUri = `${APP_URL}/api/calendar/nylas/callback`

  const tokenRes = await fetch(`${NYLAS_API_URI}/v3/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: NYLAS_CLIENT_ID,
      client_secret: NYLAS_API_KEY,
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()

  if (!tokenRes.ok) {
    console.error('Nylas token exchange failed:', tokenData)
    return NextResponse.redirect(`${APP_URL}/settings?error=calendar_auth_failed`)
  }

  const { grant_id, email, provider } = tokenData

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  await supabase.from('calendar_connections').upsert(
    { user_id: user.id, grant_id, email, provider, is_active: true, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )

  return NextResponse.redirect(`${APP_URL}/settings?connected=1`)
}
