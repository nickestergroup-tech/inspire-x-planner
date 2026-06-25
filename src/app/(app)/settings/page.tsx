'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CalendarDays, CheckCircle2, Link2Off, Loader2 } from 'lucide-react'

interface CalendarConnection {
  grant_id: string
  email: string | null
  provider: string | null
  is_active: boolean
  created_at: string
}

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Calendar',
  microsoft: 'Outlook / Microsoft 365',
  icloud: 'Apple iCloud Calendar',
  ews: 'Microsoft Exchange',
}

const PROVIDER_ICONS: Record<string, string> = {
  google: '🗓️',
  microsoft: '📅',
  icloud: '🍎',
  ews: '💼',
}

export default function SettingsPage() {
  const [connection, setConnection] = useState<CalendarConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  const justConnected = searchParams.get('connected') === '1'
  const authError = searchParams.get('error')

  useEffect(() => {
    loadConnection()
  }, [])

  async function loadConnection() {
    setLoading(true)
    const { data } = await supabase
      .from('calendar_connections')
      .select('*')
      .single()
    setConnection(data ?? null)
    setLoading(false)
  }

  async function handleConnect() {
    setConnecting(true)
    window.location.href = '/api/calendar/nylas/auth'
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await fetch('/api/calendar/nylas/disconnect', { method: 'POST' })
      setConnection(null)
    } finally {
      setDisconnecting(false)
    }
  }

  const providerLabel = connection?.provider
    ? PROVIDER_LABELS[connection.provider] ?? connection.provider
    : null
  const providerIcon = connection?.provider
    ? PROVIDER_ICONS[connection.provider] ?? '📅'
    : null

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Calendar Integration */}
        <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1a2235] flex items-center justify-center">
              <CalendarDays size={20} className="text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Calendar Integration</h2>
              <p className="text-[#475569] text-xs">Sync your actions with Google, Apple, or Outlook</p>
            </div>
          </div>

          {justConnected && (
            <div className="mb-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">
              <CheckCircle2 size={16} />
              Calendar connected successfully!
            </div>
          )}

          {authError && (
            <div className="mb-4 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              Connection failed — please try again.
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-[#475569] text-sm">
              <Loader2 size={14} className="animate-spin" />
              Loading…
            </div>
          ) : connection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#0a0f1a] rounded-lg p-3">
                <span className="text-xl">{providerIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{providerLabel ?? 'Calendar'}</p>
                  {connection.email && (
                    <p className="text-[#475569] text-xs truncate">{connection.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Connected
                </div>
              </div>

              <p className="text-[#475569] text-xs">
                Actions with a scheduled date will automatically appear in your calendar. Changes sync both ways.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="border-[#1f2d45] bg-[#1a2235] text-[#94a3b8] hover:text-red-400 hover:border-red-400/30"
              >
                {disconnecting ? <Loader2 size={14} className="animate-spin mr-2" /> : <Link2Off size={14} className="mr-2" />}
                Disconnect Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#94a3b8] text-sm">
                Connect your calendar to sync scheduled actions automatically. Works with:
              </p>
              <ul className="space-y-1.5">
                {[
                  { icon: '🗓️', label: 'Google Calendar' },
                  { icon: '🍎', label: 'Apple iCloud Calendar' },
                  { icon: '📅', label: 'Outlook / Microsoft 365' },
                ].map(({ icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                    <span>{icon}</span> {label}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold"
              >
                {connecting ? <Loader2 size={14} className="animate-spin mr-2" /> : <CalendarDays size={14} className="mr-2" />}
                Connect Your Calendar
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
