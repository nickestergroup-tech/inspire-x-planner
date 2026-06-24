'use client'

import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ContextMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
  separator?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  className?: string
}

export function ContextMenu({ items, className }: ContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#111827] border-[#1f2d45] text-white min-w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => (
          <div key={i}>
            {item.separator && i > 0 && (
              <DropdownMenuSeparator className="bg-[#1f2d45]" />
            )}
            <DropdownMenuItem
              onClick={item.onClick}
              className={`cursor-pointer ${
                item.danger
                  ? 'text-[#ef4444] focus:text-[#ef4444] focus:bg-[#1a2235]'
                  : 'hover:bg-[#1a2235] focus:bg-[#1a2235]'
              }`}
            >
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
