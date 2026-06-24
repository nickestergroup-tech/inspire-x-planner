'use client'

import { Check } from 'lucide-react'
import { CATEGORY_COLORS } from '@/types'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827]"
          style={{ backgroundColor: color }}
        >
          {value === color && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
