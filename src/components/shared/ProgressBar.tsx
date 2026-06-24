interface ProgressBarProps {
  value: number   // 0-100
  color?: string
  className?: string
}

export function ProgressBar({ value, color = '#f97316', className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full h-1.5 bg-[#1a2235] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}
