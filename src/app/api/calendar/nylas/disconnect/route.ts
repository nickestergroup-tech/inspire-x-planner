import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NYLAS_API_KEY = process.env.NYLAS_API_KEY!
const NYLAS_API_URI = process.env.NYLAS_API_URI!

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase
    .from('calendar_connections')
    .select('grant_id')
    .eq('user_id', user.id)
    .single()

  if (conn?.grant_id) {
    await fetch(`${NYLAS_API_URI}/v3/grants/${conn.grant_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${NYLAS_API_KEY}` },
    }).catch(() => {})
  }

  await supabase.from('calendar_connections').delete().eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
