'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

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
          <p className="text-[#94a3b8] text-sm">Powered by Inspire X</p>
        </div>

        <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-8">
          <h1 className="text-xl font-bold text-white mb-6">Create account</h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Rob Nickester"
                className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
              />
            </div>

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
                className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
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
                minLength={6}
                placeholder="Min. 6 characters"
                className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
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
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#94a3b8]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f97316] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
