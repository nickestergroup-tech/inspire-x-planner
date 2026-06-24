import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/layout/TopNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1a]">
      <TopNav
        userName={profile?.full_name ?? user.email ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1">{children}</main>
    </div>
  )
}
