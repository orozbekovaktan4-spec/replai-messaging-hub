'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useFeedback } from './feedback-provider'

export function Logo() {
  return (
    <span className="text-xl font-bold tracking-tight">
      <span className="text-foreground">REPL</span>
      <span className="text-brand-gradient">AI</span>
    </span>
  )
}

export function Header({ title }: { title: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { confirm, toast } = useFeedback()

  useEffect(() => setMounted(true), [])
  const isDark = !mounted || resolvedTheme === 'dark'

  const handleLogout = async () => {
    const ok = await confirm({ message: 'You will be signed out of the REPLAI admin panel.', confirmLabel: 'Log out' })
    if (ok) toast('info', 'You have been signed out.')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex w-[260px] items-center">
        <Logo />
      </div>
      <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground" aria-live="polite">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <div className="mr-2 flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-primary-foreground"
            aria-hidden
          >
            SA
          </div>
          <span className="hidden text-sm font-medium text-foreground lg:inline">Super Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-all duration-200 hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="size-4" aria-hidden />
          <span className="hidden lg:inline">Logout</span>
          <span className="sr-only lg:hidden">Logout</span>
        </button>
      </div>
    </header>
  )
}
