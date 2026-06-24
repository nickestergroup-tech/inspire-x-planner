'use client'

import Link from 'next/link'
import { Project, Category } from '@/types'
import { ContextMenu } from '@/components/shared/ContextMenu'
import { CategoryBadge } from '@/components/shared/CategoryBadge'

interface ProjectCardProps {
  project: Project
  category?: Category
  onEdit: (project: Project) => void
  onArchive: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, category, onEdit, onArchive, onDelete }: ProjectCardProps) {
  const menuItems = [
    { label: 'Edit Project', onClick: () => onEdit(project) },
    { label: 'Archive Project', onClick: () => onArchive(project) },
    { label: 'Delete Project', onClick: () => onDelete(project), danger: true, separator: true },
  ]

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#111827] border border-[#1f2d45] hover:border-[#f97316]/50 transition-all duration-200 hover:scale-[1.02]">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: category
                ? `linear-gradient(135deg, ${category.color}33 0%, ${category.color}11 100%)`
                : 'linear-gradient(135deg, #1a2235 0%, #111827 100%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {category && <CategoryBadge category={category} size="sm" />}
          <div onClick={(e) => e.preventDefault()} className="ml-auto">
            <ContextMenu items={menuItems} />
          </div>
        </div>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-black tracking-widest uppercase text-sm leading-tight mb-1">
            {project.name}
          </h3>
          {project.ultimate_result && (
            <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">
              {project.ultimate_result}
            </p>
          )}
        </div>

        {/* Color accent */}
        {category && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: category.color }} />
        )}
      </div>
    </Link>
  )
}
