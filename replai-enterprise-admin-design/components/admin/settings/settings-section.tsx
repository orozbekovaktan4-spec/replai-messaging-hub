'use client'

import { useState } from 'react'
import { Bell, CreditCard, KeyRound, Lock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '../primitives'
import { GeneralTab, SecurityTab, NotificationsTab } from './settings-tabs'
import { ApiKeysTab, BillingTab } from './settings-tabs-extra'

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: KeyRound },
  { id: 'billing', label: 'Billing', icon: CreditCard },
] as const

type TabId = (typeof tabs)[number]['id']

export function SettingsSection() {
  const [tab, setTab] = useState<TabId>('general')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform defaults, security, and billing.</p>
      </div>

      <div className="flex items-start gap-6">
        <div role="tablist" aria-orientation="vertical" aria-label="Settings" className="flex w-[200px] shrink-0 flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                  e.preventDefault()
                  const i = tabs.findIndex((x) => x.id === tab)
                  const next = tabs[(i + (e.key === 'ArrowDown' ? 1 : tabs.length - 1)) % tabs.length]
                  setTab(next.id)
                  document.getElementById(`tab-${next.id}`)?.focus()
                }}
                tabIndex={active ? 0 : -1}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
                  active
                    ? 'bg-primary/12 font-semibold text-primary'
                    : 'font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t.label}
              </button>
            )
          })}
        </div>

        <Card className="min-w-0 flex-1 p-8">
          <div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="animate-fade-in">
            {tab === 'general' && <GeneralTab />}
            {tab === 'security' && <SecurityTab />}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'api' && <ApiKeysTab />}
            {tab === 'billing' && <BillingTab />}
          </div>
        </Card>
      </div>
    </div>
  )
}
