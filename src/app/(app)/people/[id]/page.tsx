import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PersonDetailClient } from './PersonDetailClient'

export default async function PersonDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: person } = await supabase
    .from('people')
    .select('*, notes:person_notes(*)')
    .eq('id', params.id)
    .single()

  if (!person) redirect('/people')

  return <PersonDetailClient person={person} />
}
