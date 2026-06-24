'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Person, PersonNote, NOTE_TYPES } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

function NoteTypeSection({ type, label, emoji, notes, personId, onNoteAdd, onNoteDelete, onNoteUpdate }: {
  type: string; label: string; emoji: string
  notes: PersonNote[]; personId: string
  onNoteAdd: (type: string, content: string) => Promise<void>
  onNoteDelete: (noteId: string) => void
  onNoteUpdate: (noteId: string, content: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  async function handleAdd() {
    if (!draft.trim()) return
    await onNoteAdd(type, draft.trim())
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-4">
      <h3 className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-white mb-3">
        <span className="text-base">{emoji}</span>
        {label}
        <span className="text-[#475569] font-normal ml-auto">{notes.length}</span>
      </h3>

      <div className="space-y-2 mb-3">
        {notes.map((note) => (
          <NoteRow key={note.id} note={note} onDelete={() => onNoteDelete(note.id)} onUpdate={onNoteUpdate} />
        ))}
      </div>

      {adding ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
              if (e.key === 'Escape') { setAdding(false); setDraft('') }
            }}
            placeholder="Write a note..."
            rows={3}
            autoFocus
            className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#f97316]/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="px-3 py-1.5 bg-[#f97316] hover:bg-orange-600 text-white text-xs rounded-lg disabled:opacity-40"
            >
              Save
            </button>
            <button onClick={() => { setAdding(false); setDraft('') }} className="text-xs text-[#475569] hover:text-white px-2">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f97316] transition-colors"
        >
          <Plus size={11} /> Add note
        </button>
      )}
    </div>
  )
}

function NoteRow({ note, onDelete, onUpdate }: {
  note: PersonNote; onDelete: () => void; onUpdate: (id: string, content: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note.content)

  function save() {
    if (value.trim()) onUpdate(note.id, value.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
          if (e.key === 'Escape') { setValue(note.content); setEditing(false) }
        }}
        autoFocus
        rows={2}
        className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#f97316]/50 resize-none"
      />
    )
  }

  return (
    <div className="flex items-start gap-2 group py-0.5">
      <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-2 flex-shrink-0" />
      <p onClick={() => setEditing(true)} className="flex-1 text-sm text-[#94a3b8] cursor-text hover:text-white leading-relaxed">
        {note.content}
      </p>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-red-400 transition-all mt-0.5 flex-shrink-0">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

export function PersonDetailClient({ person: initialPerson }: { person: Person }) {
  const [person, setPerson] = useState<Person>(initialPerson)
  const supabase = createClient()

  async function handleNoteAdd(type: string, content: string) {
    const { data } = await supabase.from('person_notes').insert({ person_id: person.id, note_type: type, content }).select().single()
    if (data) {
      setPerson((prev) => ({ ...prev, notes: [...(prev.notes ?? []), data] }))
    }
  }

  function handleNoteDelete(noteId: string) {
    supabase.from('person_notes').delete().eq('id', noteId)
    setPerson((prev) => ({ ...prev, notes: (prev.notes ?? []).filter((n) => n.id !== noteId) }))
  }

  async function handleNoteUpdate(noteId: string, content: string) {
    await supabase.from('person_notes').update({ content }).eq('id', noteId)
    setPerson((prev) => ({ ...prev, notes: (prev.notes ?? []).map((n) => n.id === noteId ? { ...n, content } : n) }))
  }

  const notes = person.notes ?? []

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center gap-3">
        <Link href="/people" className="flex items-center gap-1.5 text-[#475569] hover:text-white text-xs font-semibold tracking-widest uppercase">
          <ChevronLeft size={14} /> People
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Person hero */}
        <div className="flex items-center gap-4 mb-8">
          {person.photo_url ? (
            <img src={person.photo_url} alt={person.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#f97316] flex items-center justify-center">
              <span className="text-white text-xl font-black">{getInitials(person.name)}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-white">{person.name}</h1>
            <p className="text-[#475569] text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Note sections */}
        <div className="space-y-4">
          {NOTE_TYPES.map(({ type, label, emoji }) => (
            <NoteTypeSection
              key={type}
              type={type}
              label={label}
              emoji={emoji}
              notes={notes.filter((n) => n.note_type === type)}
              personId={person.id}
              onNoteAdd={handleNoteAdd}
              onNoteDelete={handleNoteDelete}
              onNoteUpdate={handleNoteUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
