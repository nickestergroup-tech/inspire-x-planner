import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns'

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 })
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart)
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'd, yyyy')}`
  }
  return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function nextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1)
}

export function prevWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1)
}

export { isToday, isSameDay, format }
