'use client'

import { useState } from 'react'
import { Star, Clock, Pencil, Trash2, Check } from 'lucide-react'
import { Action } from '@/types'
import { formatMinutes } from '@/lib/dates'
import { createClient } from '@/lib/supabase/client'

interface ActionItemProps {
  action: Action
  onUpdate: (action: Action) => void
  onDelete: (id: string) => void
  onEdit: (action: Action) => void
  accentColor?: string
}

export function ActionItem({ action, onUpdate, onDelete, onEdit, accentColor = '#f97316' }: ActionItemProps) {
  const supabase = createClient()

  async function toggleComplete() {
    const is_complete = !action.is_complete
    await supabase.from('actions').update({ is_complete }).eq('id', action.id)
    onUpdate({ ...action, is_complete })
  }

  async function toggleStar() {
    const is_starred = !action.is_starred
    await supabase.from('actions').update({ is_starred }).eq('id', action.id)
    onUpdate({ ...action, is_starred })
  }

  async function handleDelete() {
    await supabase.from('actions').delete().eq('id', action.id)
    onDelete(action.id)
  }

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg group hover:bg-[#1a2235] transition-colors ${
        action.is_complete ? 'opacity-50' : ''
      }`}
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      {/* Checkbox */}
      <button
        onClick={toggleComplete}
        className="w-5 h-5 rounded border border-[#1f2d45] flex-shrink-0 flex items-center justify-center hover:border-[#f97316] transition-colors"
        style={{ backgroundColor: action.is_complete ? accentColor : 'transparent' }}
      >
        {action.is_complete && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* Title */}
      <span
        className={`flex-1 text-sm min-w-0 truncate ${
          action.is_complete ? 'line-through text-[#475569]' : 'text-white'
        }`}
      >
        {action.title}
      </span>

      {/* Duration */}
      <span className="text-xs text-[#475569] flex items-center gap-1 flex-shrink-0">
        <Clock size={11} />
        {formatMinutes(action.estimated_minutes)}
      </span>

      {/* Star */}
      <button
        onClick={toggleStar}
        className={`flex-shrink-0 transition-colors ${
          action.is_starred ? 'text-yellow-400' : 'text-[#475569] opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star size={13} fill={action.is_starred ? 'currentColor' : 'none'} />
      </button>

      {/* Actions (show on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(action)}
          className="p-1 rounded text-[#475569] hover:text-white transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 rounded text-[#475569] hover:text-[#ef4444] transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
