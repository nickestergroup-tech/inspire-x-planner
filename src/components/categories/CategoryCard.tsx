'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Category } from '@/types'
import { ICON_MAP } from './IconPicker'
import { ContextMenu } from '@/components/shared/ContextMenu'
import { createClient } from '@/lib/supabase/client'

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onArchive: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryCard({ category, onEdit, onArchive, onDelete }: CategoryCardProps) {
  const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']

  const menuItems = category.is_system
    ? []
    : [
        { label: 'Edit Category', onClick: () => onEdit(category) },
        { label: 'Archive Category', onClick: () => onArchive(category) },
        { label: 'Delete Category', onClick: () => onDelete(category), danger: true, separator: true },
      ]

  return (
    <Link href={`/categories/${category.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#111827] border border-[#1f2d45] hover:border-[#f97316]/50 transition-all duration-200 hover:scale-[1.02]">
        {/* Cover image */}
        {category.cover_image_url ? (
          <img
            src={category.cover_image_url}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${category.color}33 0%, ${category.color}11 100%)`,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top row: icon badge + context menu */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            <Icon size={18} className="text-white" />
          </div>

          {!category.is_system && (
            <div onClick={(e) => e.preventDefault()}>
              <ContextMenu items={menuItems} />
            </div>
          )}
        </div>

        {/* Bottom: name + subtitle */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-black tracking-widest uppercase text-sm leading-tight mb-1">
            {category.name}
          </h3>
          {category.ultimate_vision && (
            <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
              {category.ultimate_vision}
            </p>
          )}
          {category.is_system && (
            <p className="text-white/50 text-xs italic">System category</p>
          )}
        </div>

        {/* Color accent glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: category.color }}
        />
      </div>
    </Link>
  )
}
