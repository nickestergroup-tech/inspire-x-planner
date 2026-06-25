'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { Category } from '@/types'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { BigPicture } from '@/components/categories/BigPicture'

interface CategoryDetailClientProps {
  initialCategory: Category
}

export function CategoryDetailClient({ initialCategory }: CategoryDetailClientProps) {
  const [category, setCategory] = useState<Category>(initialCategory)
  const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        {category.cover_image_url ? (
          <img
            src={category.cover_image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${category.color}55 0%, ${category.color}22 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0a0f1a]" />

        {/* Back */}
        <div className="absolute top-4 left-6">
          <Link
            href="/categories"
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} />
            Categories
          </Link>
        </div>

        {/* Spotlight link */}
        <div className="absolute top-4 right-6">
          <Link
            href={`/spotlight/${category.id}`}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ExternalLink size={14} />
            Spotlight
          </Link>
        </div>

        {/* Category info */}
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-black tracking-widest uppercase text-2xl">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tab nav */}
        <div className="flex gap-1 mb-8 bg-[#111827] border border-[#1f2d45] rounded-xl p-1 w-fit">
          <span className="px-4 py-2 rounded-lg bg-[#f97316] text-white text-sm font-medium">
            The Big Picture
          </span>
          <Link
            href={`/categories/${category.id}/actions`}
            className="px-4 py-2 rounded-lg text-[#94a3b8] hover:text-white text-sm font-medium transition-colors"
          >
            Actions &amp; Blocks
          </Link>
        </div>

        <BigPicture category={category} onCategoryUpdate={setCategory} />
      </div>
    </div>
  )
}
