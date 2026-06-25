'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_COVERS = [
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/health.jpg',
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/career.jpg',
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/relationships.jpg',
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/mind.jpg',
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/finance.jpg',
  'https://yixlzrnbziwiwqubdqha.supabase.co/storage/v1/object/public/Category-Covers/adventure.jpg',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&q=80',
]

interface CoverImagePickerProps {
  value: string | null
  onChange: (url: string | null) => void
  uploadPath?: string
}

export function CoverImagePicker({ value, onChange, uploadPath = 'covers' }: CoverImagePickerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }

    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${uploadPath}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('images').upload(filename, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('images').getPublicUrl(filename)
      onChange(data.publicUrl)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Current value preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden aspect-[16/6] group">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f97316] hover:bg-orange-600 text-white text-xs rounded-lg"
            >
              <Upload size={12} /> Upload new
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Default covers grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#475569]">Choose a cover</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f97316] transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-3 h-3 border border-[#f97316] border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={11} /> Upload your own
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {DEFAULT_COVERS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onChange(url)}
              className={`relative rounded-lg overflow-hidden aspect-[16/9] border-2 transition-all ${
                value === url ? 'border-[#f97316] scale-[1.02]' : 'border-transparent hover:border-[#f97316]/50'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
