'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/categories')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-[#f97316]" size={32} />
            <span className="text-2xl font-black tracking-widest uppercase text-white">
              Inspire X
            </span>
          </div>
          <p className="text-[#94a3b8] text-sm">Inspire X Planner</p>
        </div>

        <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-8">
          <h1 className="text-xl font-bold text-white mb-6">Sign in</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] focus:ring-[#f97316]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] focus:ring-[#f97316]"
              />
            </div>

            {error && (
              <p className="text-[#ef4444] text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#94a3b8]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#f97316] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
