'use client'

import { useState } from 'react'
import { Plus, Search, User, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Person, PersonNote, NOTE_TYPES } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface PeopleClientProps {
  initialPeople: Person[]
}

function NoteTypeSection({ type, label, emoji, notes, personId, onNoteAdd, onNoteDelete, onNoteUpdate }: {
  type: string; label: string; emoji: string
  notes: PersonNote[]; personId: string
  onNoteAdd: (personId: string, type: string, content: string) => Promise<void>
  onNoteDelete: (noteId: string, personId: string) => void
  onNoteUpdate: (noteId: string, content: string) => void
}) {
  const [expanded, setExpanded] = useState(notes.length > 0)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!draft.trim()) return
    setSaving(true)
    await onNoteAdd(personId, type, draft.trim())
    setDraft('')
    setAdding(false)
    setSaving(false)
  }

  return (
    <div className="border-t border-[#1f2d45] pt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <span className="text-base">{emoji}</span>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#94a3b8] flex-1">{label}</span>
        {notes.length > 0 && <span className="text-xs text-[#475569]">{notes.length}</span>}
        {expanded ? <ChevronDown size={12} className="text-[#475569]" /> : <ChevronRight size={12} className="text-[#475569]" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 pl-6">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} onDelete={() => onNoteDelete(note.id, personId)} onUpdate={onNoteUpdate} />
          ))}
          {adding ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() }
                  if (e.key === 'Escape') { setAdding(false); setDraft('') }
                }}
                placeholder="Add a note..."
                rows={2}
                autoFocus
                className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded-lg px-2 py-1.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#f97316]/50 resize-none"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleAdd}
                  disabled={saving || !draft.trim()}
                  className="text-xs px-2 py-1 bg-[#f97316] hover:bg-orange-600 text-white rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setAdding(false); setDraft('') }}
                  className="text-xs px-2 py-1 text-[#475569] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setExpanded(true); setAdding(true) }}
              className="text-xs text-[#475569] hover:text-[#f97316] transition-colors flex items-center gap-1"
            >
              <Plus size={10} /> Add note
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function NoteItem({ note, onDelete, onUpdate }: {
  note: PersonNote; onDelete: () => void; onUpdate: (id: string, content: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note.content)

  function save() {
    if (value.trim()) {
      onUpdate(note.id, value.trim())
    }
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
        className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#f97316]/50 resize-none"
      />
    )
  }

  return (
    <div className="flex items-start gap-1.5 group py-0.5">
      <div className="w-1 h-1 rounded-full bg-[#475569] mt-1.5 flex-shrink-0" />
      <p
        onClick={() => setEditing(true)}
        className="flex-1 text-xs text-[#94a3b8] cursor-text hover:text-white"
      >
        {note.content}
      </p>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 size={10} />
      </button>
    </div>
  )
}

function PersonCard({ person, onDelete, onNoteAdd, onNoteDelete, onNoteUpdate }: {
  person: Person
  onDelete: (id: string) => void
  onNoteAdd: (personId: string, type: string, content: string) => Promise<void>
  onNoteDelete: (noteId: string, personId: string) => void
  onNoteUpdate: (noteId: string, content: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const notes = person.notes ?? []

  return (
    <div className="bg-[#111827] border border-[#1f2d45] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a2235] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{getInitials(person.name)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{person.name}</p>
          <p className="text-[#475569] text-xs">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(person.id) }}
            className="text-[#475569] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronDown size={14} className="text-[#475569]" /> : <ChevronRight size={14} className="text-[#475569]" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {NOTE_TYPES.map(({ type, label, emoji }) => (
            <NoteTypeSection
              key={type}
              type={type}
              label={label}
              emoji={emoji}
              notes={notes.filter((n) => n.note_type === type)}
              personId={person.id}
              onNoteAdd={onNoteAdd}
              onNoteDelete={onNoteDelete}
              onNoteUpdate={onNoteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PeopleClient({ initialPeople }: PeopleClientProps) {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const supabase = createClient()

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddPerson() {
    if (!newName.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('people').insert({ name: newName.trim(), user_id: user.id }).select().single()
    if (data) {
      setPeople((prev) => [...prev, { ...data, notes: [] }])
      setNewName('')
      setAdding(false)
    }
  }

  async function handleDeletePerson(id: string) {
    await supabase.from('people').delete().eq('id', id)
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleNoteAdd(personId: string, noteType: string, content: string) {
    const { data } = await supabase
      .from('person_notes')
      .insert({ person_id: personId, note_type: noteType, content })
      .select()
      .single()
    if (data) {
      setPeople((prev) => prev.map((p) =>
        p.id === personId ? { ...p, notes: [...(p.notes ?? []), data] } : p
      ))
    }
  }

  function handleNoteDelete(noteId: string, personId: string) {
    supabase.from('person_notes').delete().eq('id', noteId)
    setPeople((prev) => prev.map((p) =>
      p.id === personId ? { ...p, notes: (p.notes ?? []).filter((n) => n.id !== noteId) } : p
    ))
  }

  async function handleNoteUpdate(noteId: string, content: string) {
    await supabase.from('person_notes').update({ content }).eq('id', noteId)
    setPeople((prev) => prev.map((p) => ({
      ...p,
      notes: (p.notes ?? []).map((n) => n.id === noteId ? { ...n, content } : n),
    })))
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">People</h1>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          className="bg-[#f97316] hover:bg-orange-600 text-white h-7 px-3 text-xs gap-1"
        >
          <Plus size={12} /> Add Person
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full bg-[#111827] border border-[#1f2d45] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#f97316]/50"
          />
        </div>

        {/* Add new person */}
        {adding && (
          <div className="bg-[#111827] border border-[#f97316]/40 rounded-xl p-4 flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-[#1a2235] flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-[#475569]" />
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddPerson()
                if (e.key === 'Escape') { setAdding(false); setNewName('') }
              }}
              placeholder="Person's name..."
              autoFocus
              className="flex-1 bg-transparent text-white placeholder-[#475569] focus:outline-none text-sm"
            />
            <button
              onClick={handleAddPerson}
              disabled={!newName.trim()}
              className="text-xs px-3 py-1.5 bg-[#f97316] hover:bg-orange-600 text-white rounded-lg disabled:opacity-40"
            >
              Add
            </button>
            <button onClick={() => { setAdding(false); setNewName('') }} className="text-[#475569] hover:text-white text-xs">
              Cancel
            </button>
          </div>
        )}

        {/* People list */}
        {filtered.length === 0 && !adding ? (
          <div className="text-center py-16">
            <User size={32} className="text-[#1f2d45] mx-auto mb-3" />
            <p className="text-[#475569] italic mb-4">
              {search ? 'No people found' : 'No people yet'}
            </p>
            {!search && (
              <Button onClick={() => setAdding(true)} className="bg-[#f97316] hover:bg-orange-600 text-white">
                <Plus size={14} className="mr-1.5" /> Add Your First Person
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onDelete={handleDeletePerson}
                onNoteAdd={handleNoteAdd}
                onNoteDelete={handleNoteDelete}
                onNoteUpdate={handleNoteUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
