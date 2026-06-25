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
    .eq('is_active', true)
    .single()

  if (!conn?.grant_id) return NextResponse.json({ ok: true, skipped: true })

  const body = await req.json()
  const { action_id, title, planned_date, estimated_minutes, notes, nylas_event_id: existingEventId } = body

  if (!planned_date) return NextResponse.json({ ok: true, skipped: true })

  const startDate = new Date(`${planned_date}T09:00:00`)
  const endDate = new Date(startDate.getTime() + (estimated_minutes ?? 30) * 60 * 1000)

  const eventPayload = {
    title,
    description: notes || undefined,
    when: {
      start_time: Math.floor(startDate.getTime() / 1000),
      end_time: Math.floor(endDate.getTime() / 1000),
    },
  }

  let eventId = existingEventId

  if (existingEventId) {
    const res = await fetch(
      `${NYLAS_API_URI}/v3/grants/${conn.grant_id}/events/${existingEventId}?calendar_id=primary`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${NYLAS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      }
    )
    if (!res.ok) eventId = null
  }

  if (!eventId) {
    const res = await fetch(
      `${NYLAS_API_URI}/v3/grants/${conn.grant_id}/events?calendar_id=primary`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${NYLAS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      }
    )
    if (res.ok) {
      const data = await res.json()
      eventId = data.data?.id ?? null
    }
  }

  if (eventId && action_id) {
    await supabase.from('actions').update({ nylas_event_id: eventId }).eq('id', action_id)
  }

  return NextResponse.json({ ok: true, nylas_event_id: eventId })
}
