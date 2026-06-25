'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays,
  Users,
  FolderOpen,
  LayoutGrid,
  ChevronDown,
  Plus,
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

interface TopNavProps {
  userName?: string | null
  avatarUrl?: string | null
}

export function TopNav({ userName, avatarUrl }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(path: string) {
    return pathname.startsWith(path)
  }

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-white bg-[#1a2235]'
        : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2235]'
    }`

  const menuItemClass = 'cursor-pointer hover:bg-[#1a2235] text-white'

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 bg-[#111827] border-b border-[#1f2d45]">
      {/* Logo */}
      <Link href="/categories" className="flex items-center mr-6">
        <Image src="/logo-full.png" alt="Inspire X" width={120} height={36} style={{ objectFit: 'contain' }} />
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-1">
        <Link href="/calendar" className={navLinkClass('/calendar')}>
          <CalendarDays size={15} />
          <span className="hidden md:inline">Calendar</span>
        </Link>

        {/* My Week dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/my-plan/weekly')
                ? 'text-white bg-[#1a2235]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2235]'
            }`}
          >
            <span className="hidden md:inline">My Week</span>
            <ChevronDown size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111827] border-[#1f2d45] text-white">
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/my-plan/weekly/capture')}>
              Weekly Capture
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/my-plan/weekly/plan')}>
              Weekly Plan
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/my-plan/weekly/celebrate')}>
              Weekly Reflection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/my-plan/daily/plan" className={navLinkClass('/my-plan/daily')}>
          <span className="hidden md:inline">My Day</span>
        </Link>

        <Link href="/people" className={navLinkClass('/people')}>
          <Users size={15} />
          <span className="hidden md:inline">People</span>
        </Link>

        <Link href="/projects" className={navLinkClass('/projects')}>
          <FolderOpen size={15} />
          <span className="hidden md:inline">Projects</span>
        </Link>

        <Link href="/categories" className={navLinkClass('/categories')}>
          <LayoutGrid size={15} />
          <span className="hidden md:inline">Categories</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Create button */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-medium transition-colors">
            <Plus size={14} />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown size={12} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111827] border-[#1f2d45] text-white">
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/categories?new=1')}>
              New Category
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/projects?new=1')}>
              New Project
            </DropdownMenuItem>
            <DropdownMenuItem className={menuItemClass} onClick={() => router.push('/my-plan/weekly/capture?new=action')}>
              New Action
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full ring-0 outline-none">
            <Avatar className="h-8 w-8 border-2 border-[#1f2d45]">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="bg-[#f97316] text-white text-xs font-bold">
                {userName ? getInitials(userName) : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-[#111827] border-[#1f2d45] text-white"
          >
            {userName && (
              <>
                <div className="px-3 py-2 text-sm text-[#94a3b8]">{userName}</div>
                <DropdownMenuSeparator className="bg-[#1f2d45]" />
              </>
            )}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-[#ef4444] hover:bg-[#1a2235]"
            >
              <LogOut size={14} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
