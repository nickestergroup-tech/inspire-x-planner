export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  cover_image_url: string | null
  is_system: boolean
  is_archived: boolean
  sort_order: number
  ultimate_vision: string | null
  my_roles: string | null
  ultimate_purpose: string | null
  created_at: string
  updated_at: string
}

export interface GoalHorizon {
  id: string
  category_id: string
  label: string
  timeframe_type: string
  content: string | null
  sort_order: number
  created_at: string
  micro_goals?: MicroGoal[]
}

export interface MicroGoal {
  id: string
  horizon_id: string
  title: string
  is_complete: boolean
  sort_order: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  category_id: string | null
  name: string
  ultimate_result: string | null
  ultimate_purpose: string | null
  cover_image_url: string | null
  is_archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface InspirationImage {
  id: string
  project_id: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface KeyResult {
  id: string
  project_id: string
  title: string
  due_date: string | null
  is_starred: boolean
  is_complete: boolean
  sort_order: number
  created_at: string
}

export interface RpmBlock {
  id: string
  user_id: string
  category_id: string | null
  project_id: string | null
  name: string | null
  result: string | null
  purpose: string | null
  is_complete: boolean
  sort_order: number
  created_at: string
  updated_at: string
  actions?: Action[]
}

export interface Action {
  id: string
  user_id: string
  category_id: string | null
  project_id: string | null
  block_id: string | null
  key_result_id: string | null
  title: string
  notes: string | null
  estimated_minutes: number
  is_starred: boolean
  is_complete: boolean
  is_recurring: boolean
  recurrence_rule: string | null
  week_start: string | null
  planned_date: string | null
  planned_time: string | null
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
  project?: Project
}

export interface Week {
  id: string
  user_id: string
  week_start: string
  is_complete: boolean
  reflection_text: string | null
}

export interface Person {
  id: string
  user_id: string
  name: string
  photo_url: string | null
  sort_order: number
  created_at: string
  notes?: PersonNote[]
}

export interface PersonNote {
  id: string
  person_id: string
  note_type: string
  content: string
  sort_order: number
  created_at: string
}

export interface CalendarIntegration {
  id: string
  user_id: string
  provider: 'google' | 'outlook'
  access_token: string | null
  refresh_token: string | null
  token_expiry: string | null
  calendar_id: string | null
  is_active: boolean
  created_at: string
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  color?: string
  provider: 'google' | 'outlook'
}

export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#fb7185', // coral
  '#ec4899', // pink
  '#a855f7', // fuchsia
  '#8b5cf6', // purple
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#0ea5e9', // sky
  '#14b8a6', // teal
  '#10b981', // emerald
  '#84cc16', // lime
  '#eab308', // yellow
  '#f59e0b', // gold
] as const

export const NOTE_TYPES = [
  { type: 'birthday', label: 'Birthday / Important Dates', emoji: '🎂' },
  { type: 'discussion_points', label: 'Discussion Points', emoji: '💬' },
  { type: 'things_to_remember', label: 'Things to Remember', emoji: '💡' },
  { type: 'what_theyve_done', label: "What They've Done", emoji: '✅' },
  { type: 'leverage', label: 'Leverage', emoji: '🤝' },
  { type: 'general', label: 'General Notes', emoji: '📝' },
] as const
