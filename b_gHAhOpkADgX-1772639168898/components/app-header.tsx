'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppState } from '@/lib/store'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  BarChart3,
  Search,
  BookMarked,
  Swords,
  LayoutDashboard,
  GraduationCap,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: '学习首页', icon: LayoutDashboard },
  { href: '/learn', label: '每日学习', icon: BookOpen },
  { href: '/review', label: '单词复习', icon: GraduationCap },
  { href: '/dictionary', label: '词典查询', icon: Search },
  { href: '/notebook', label: '生词本', icon: BookMarked },
  { href: '/challenge', label: '挑战模式', icon: Swords },
  { href: '/statistics', label: '学习统计', icon: BarChart3 },
]

export function AppHeader() {
  const pathname = usePathname()
  const { state, dispatch } = useAppState()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!state.user) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">WordMaster</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {state.user.username}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              dispatch({ type: 'LOGOUT' })
              window.location.href = '/'
            }}
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-2 lg:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
