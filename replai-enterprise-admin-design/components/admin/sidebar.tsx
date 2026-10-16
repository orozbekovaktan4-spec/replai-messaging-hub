'use client'

import { BarChart3, Building2, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SectionId = 'businesses' | 'analytics' | 'settings'

export const sections = [
  { id: 'businesses', label: 'Businesses Management', icon: Building2, group: 'Management' },
  { id: 'analytics', label: 'Platform Analytics', icon: BarChart3, group: 'Management' },
  { id: 'settings', label: 'System Settings', icon: Settings, group: 'Configuration' },
] as const

const groups = ['Management', 'Configuration'] as const

export function Sidebar({ active, onChange }: { active: SectionId; onChange: (id: SectionId) => void }) {
  return (
    <aside className="fixed bottom-0 left-0 top-16 z-30 flex w-[72px] flex-col border-r border-sidebar-border bg-sidebar lg:w-[260px]">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4 lg:px-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">REPLAI Inc.</p>
          <p className="truncate text-xs text-muted-foreground">AI Messaging Hub</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 p-3 lg:p-4">
        {groups.map((group) => (
          <div key={group} className="flex flex-col gap-1">
            <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:block">
              {group}
            </p>
            <div className="mx-auto h-px w-6 bg-sidebar-border lg:hidden" aria-hidden />
            {sections
              .filter((s) => s.group === group)
              .map((s) => {
                const Icon = s.icon
                const isActive = active === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange(s.id)}
                    aria-current={isActive ? 'page' : undefined}
                    title={s.label}
                    className={cn(
                      'flex items-center justify-center gap-3 rounded-[10px] p-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 lg:justify-start',
                      isActive
                        ? 'bg-brand-gradient text-primary-foreground shadow-lg shadow-brand-to/30'
                        : 'text-muted-foreground hover:translate-x-1 hover:bg-primary/10 hover:text-sidebar-foreground',
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden />
                    <span className="hidden truncate lg:inline">{s.label}</span>
                    <span className="sr-only lg:hidden">{s.label}</span>
                  </button>
                )
              })}
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-sidebar-border p-4 lg:block">
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          All systems operational
        </div>
      </div>
    </aside>
  )
}
