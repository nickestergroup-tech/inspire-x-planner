'use client'

import { useEffect, useState } from 'react'
import { Plus, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { Project, Category } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Record<string, Category>>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)

  const supabase = createClient()

  async function load() {
    const [projRes, catRes] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('categories').select('*'),
    ])
    setProjects(projRes.data ?? [])
    const catMap: Record<string, Category> = {}
    for (const c of catRes.data ?? []) catMap[c.id] = c
    setCategories(catMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const active = projects.filter((p) => !p.is_archived)
  const archived = projects.filter((p) => p.is_archived)

  function handleSaved(project: Project) {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = project; return next }
      return [...prev, project]
    })
  }

  async function handleArchive(project: Project) {
    await supabase.from('projects').update({ is_archived: !project.is_archived }).eq('id', project.id)
    setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, is_archived: !project.is_archived } : p))
  }

  async function handleDelete(project: Project) {
    await supabase.from('projects').delete().eq('id', project.id)
    setProjects((prev) => prev.filter((p) => p.id !== project.id))
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">Active Projects</h1>
          <p className="text-[#94a3b8] text-sm mt-1">{active.length} {active.length === 1 ? 'project' : 'projects'}</p>
        </div>
        <Button onClick={() => { setEditingProject(undefined); setFormOpen(true) }} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white gap-2">
          <Plus size={16} /> Create New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="rounded-xl aspect-[4/3] bg-[#111827] animate-pulse" />)}
        </div>
      ) : active.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to start building your RPM plan."
          action={<Button onClick={() => setFormOpen(true)} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white gap-2"><Plus size={16} />Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {active.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              category={p.category_id ? categories[p.category_id] : undefined}
              onEdit={(proj) => { setEditingProject(proj); setFormOpen(true) }}
              onArchive={handleArchive}
              onDelete={(proj) => setDeleteConfirm(proj)}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <button onClick={() => setShowArchived((v) => !v)} className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[#475569] hover:text-[#94a3b8] mb-4">
            {showArchived ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Archived Projects ({archived.length})
          </button>
          {showArchived && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-60">
              {archived.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  category={p.category_id ? categories[p.category_id] : undefined}
                  onEdit={(proj) => { setEditingProject(proj); setFormOpen(true) }}
                  onArchive={handleArchive}
                  onDelete={(proj) => setDeleteConfirm(proj)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProject(undefined) }}
        onSave={handleSaved}
        initial={editingProject}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Project?</h3>
            <p className="text-[#94a3b8] text-sm mb-6">This will permanently delete <strong className="text-white">{deleteConfirm.name}</strong> and all its actions and key results.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="text-[#94a3b8] hover:text-white hover:bg-[#1a2235]">Cancel</Button>
              <Button onClick={() => handleDelete(deleteConfirm)} className="bg-[#ef4444] hover:bg-red-600 text-white">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
