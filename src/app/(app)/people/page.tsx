import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PeopleClient } from './PeopleClient'

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: people } = await supabase
    .from('people')
    .select('*, notes:person_notes(*)')
    .order('sort_order')

  return <PeopleClient initialPeople={people ?? []} />
}
