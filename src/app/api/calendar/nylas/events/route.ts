import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NYLAS_API_KEY = process.env.NYLAS_API_KEY!
const NYLAS_API_URI = process.env.NYLAS_API_URI!

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ events: [] })

  const { data: conn } = await supabase
    .from('calendar_connections')
    .select('grant_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!conn?.grant_id) return NextResponse.json({ events: [] })

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const params = new URLSearchParams({ limit: '200', expand_recurring: 'true' })
  if (start) params.set('start', Math.floor(new Date(start).getTime() / 1000).toString())
  if (end) params.set('end', Math.floor(new Date(end).getTime() / 1000).toString())

  const res = await fetch(
    `${NYLAS_API_URI}/v3/grants/${conn.grant_id}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${NYLAS_API_KEY}`, Accept: 'application/json' } }
  )

  if (!res.ok) return NextResponse.json({ events: [] })

  const data = await res.json()
  return NextResponse.json({ events: data.data ?? [] })
}
