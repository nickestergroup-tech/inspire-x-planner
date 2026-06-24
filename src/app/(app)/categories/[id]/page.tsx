import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryDetailClient } from './CategoryDetailClient'

export default async function CategoryDetailPage({
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

  return <CategoryDetailClient initialCategory={category} />
}
