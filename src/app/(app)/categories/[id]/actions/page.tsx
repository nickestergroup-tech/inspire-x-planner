import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryActionsClient } from './CategoryActionsClient'

export default async function CategoryActionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!category) notFound()

  return <CategoryActionsClient category={category} />
}
