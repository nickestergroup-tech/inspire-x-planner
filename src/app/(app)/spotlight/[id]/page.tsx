import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SpotlightClient } from './SpotlightClient'

export default async function SpotlightPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [catRes, allCatRes] = await Promise.all([
    supabase.from('categories').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').eq('is_archived', false).order('sort_order'),
  ])

  if (!catRes.data) redirect('/categories')

  return <SpotlightClient category={catRes.data} allCategories={allCatRes.data ?? []} />
}
