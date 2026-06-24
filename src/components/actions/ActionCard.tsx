'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Action } from '@/types'
import { Star, Clock } from 'lucide-react'
import { formatMinutes } from '@/lib/dates'

interface ActionCardProps {
  action: Action
  accentColor?: string
}

export function ActionCard({ action, accentColor = '#f97316' }: ActionCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: action.id,
    data: { action },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#1a2235] border border-[#1f2d45] hover:border-[#f97316]/40 touch-none select-none group"
    >
      <div className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
      <span className="flex-1 text-white text-xs truncate">{action.title}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {action.is_starred && <Star size={10} className="text-yellow-400" fill="currentColor" />}
        <span className="text-xs text-[#475569] flex items-center gap-0.5">
          <Clock size={9} />
          {formatMinutes(action.estimated_minutes)}
        </span>
      </div>
    </div>
  )
}
