'use client'

import { useState } from 'react'
import { RpmBlock } from '@/types'
import { Check, ChevronDown, ChevronRight, Pencil, Trash2, Zap } from 'lucide-react'
import { formatMinutes } from '@/lib/dates'
import { createClient } from '@/lib/supabase/client'

interface BlockCardProps {
  block: RpmBlock
  onUpdate: (block: RpmBlock) => void
  onDelete: (id: string) => void
  onEdit: (block: RpmBlock) => void
  accentColor?: string
}

export function BlockCard({ block, onUpdate, onDelete, onEdit, accentColor = '#f97316' }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false)
  const supabase = createClient()

  const actionCount = block.actions?.length ?? 0
  const completedCount = block.actions?.filter((a) => a.is_complete).length ?? 0
  const totalMinutes = block.actions?.reduce((sum, a) => sum + a.estimated_minutes, 0) ?? 0

  async function toggleComplete() {
    const is_complete = !block.is_complete
    await supabase.from('rpm_blocks').update({ is_complete }).eq('id', block.id)
    onUpdate({ ...block, is_complete })
  }

  async function handleDelete() {
    await supabase.from('rpm_blocks').delete().eq('id', block.id)
    onDelete(block.id)
  }

  return (
    <div
      className="bg-[#111827] rounded-xl border border-[#1f2d45] overflow-hidden"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {/* Complete toggle */}
          <button
            onClick={toggleComplete}
            className="w-6 h-6 rounded border border-[#1f2d45] flex-shrink-0 flex items-center justify-center mt-0.5 hover:border-[#f97316] transition-colors"
            style={{ backgroundColor: block.is_complete ? accentColor : 'transparent' }}
          >
            {block.is_complete && <Check size={12} className="text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            {block.name && (
              <p className="text-white font-semibold text-sm mb-1">{block.name}</p>
            )}
            {block.result && (
              <div className="mb-2">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-0.5">Result</p>
                <p className="text-[#94a3b8] text-sm leading-snug line-clamp-2">{block.result}</p>
              </div>
            )}
            {block.purpose && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-0.5">Purpose</p>
                <p className="text-[#94a3b8] text-sm leading-snug line-clamp-2">{block.purpose}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(block)}
              className="p-1.5 rounded text-[#475569] hover:text-white hover:bg-[#1a2235] transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-[#475569] hover:text-[#ef4444] hover:bg-[#1a2235] transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#475569]">
            <span className="flex items-center gap-1">
              <Zap size={11} style={{ color: accentColor }} />
              {actionCount} {actionCount === 1 ? 'action' : 'actions'}
            </span>
            {totalMinutes > 0 && (
              <span>{formatMinutes(totalMinutes)}</span>
            )}
            {actionCount > 0 && (
              <span>{completedCount}/{actionCount} done</span>
            )}
          </div>

          {actionCount > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[#475569] hover:text-white transition-colors"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded actions */}
      {expanded && block.actions && block.actions.length > 0 && (
        <div className="border-t border-[#1f2d45] px-4 py-2 space-y-1">
          {block.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2 py-1 text-sm">
              <div
                className="w-4 h-4 rounded border border-[#1f2d45] flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: action.is_complete ? accentColor : 'transparent' }}
              >
                {action.is_complete && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>
              <span className={action.is_complete ? 'line-through text-[#475569]' : 'text-[#94a3b8]'}>
                {action.title}
              </span>
              <span className="ml-auto text-xs text-[#475569]">
                {formatMinutes(action.estimated_minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
