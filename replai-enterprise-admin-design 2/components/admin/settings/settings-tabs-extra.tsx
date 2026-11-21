'use client'

import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFeedback } from '../feedback-provider'
import { Badge, btnDanger, btnPrimary, btnSecondary } from '../primitives'
import { TabHeader } from './settings-tabs'

type ApiKey = { id: string; name: string; secret: string; created: string; lastUsed: string }

function makeSecret() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return 'rpl_live_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function ApiKeysTab() {
  const { toast, confirm, withLoading } = useFeedback()
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: 'k1',
      name: 'Production API Key',
      secret: 'rpl_live_8f2k1m9x7q4w3e5r6t0y2u8i1o3p7a9s',
      created: 'Oct 11, 2026',
      lastUsed: '2 hours ago',
    },
  ])

  const generate = async () => {
    await withLoading(() => new Promise((r) => setTimeout(r, 700)))
    setKeys((k) => [
      ...k,
      { id: `k${Date.now()}`, name: `API Key ${k.length + 1}`, secret: makeSecret(), created: 'Oct 12, 2026', lastUsed: 'Never' },
    ])
    toast('success', 'New API key generated.')
  }

  const revoke = async (key: ApiKey) => {
    const ok = await confirm({
      message: `Revoking "${key.name}" will immediately break any integration using it.`,
      confirmLabel: 'Revoke',
    })
    if (!ok) return
    setKeys((k) => k.filter((x) => x.id !== key.id))
    toast('success', `${key.name} revoked.`)
  }

  return (
    <div className="flex max-w-2xl flex-col">
      <TabHeader title="API Keys" description="Keys grant full access to the REPLAI API. Keep them secret." />
      <div className="flex flex-col gap-4">
        {keys.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No active API keys. Generate one to get started.
          </p>
        )}
        {keys.map((k) => (
          <KeyCard key={k.id} apiKey={k} onRevoke={() => revoke(k)} />
        ))}
      </div>
      <div className="mt-6">
        <button type="button" className={btnPrimary} onClick={generate}>
          <Plus className="size-4" aria-hidden />
          Generate New Key
        </button>
      </div>
    </div>
  )
}

function KeyCard({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: () => void }) {
  const { toast } = useFeedback()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast('success', 'API key copied to clipboard.')
    } catch {
      toast('error', 'Could not access the clipboard.')
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">{apiKey.name}</h3>
          <Badge tone="success" dot>
            Active
          </Badge>
        </div>
        <button type="button" className={cn(btnDanger, 'h-8 px-3 text-xs')} onClick={onRevoke}>
          Revoke
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
          {revealed ? apiKey.secret : `${apiKey.secret.slice(0, 9)}${'•'.repeat(24)}`}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy API key"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {`Created: ${apiKey.created} • Last used: ${apiKey.lastUsed}`}
      </p>
    </div>
  )
}

export function BillingTab() {
  const { toast } = useFeedback()
  const used = 65000
  const limit = 100000
  const pct = Math.round((used / limit) * 100)
  const features = ['100,000 messages per month', 'Unlimited businesses', 'All messaging channels', 'Priority support & SLA']

  return (
    <div className="flex max-w-2xl flex-col">
      <TabHeader title="Billing & Usage" description="Your subscription and this month's consumption." />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-5 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Professional Plan</h3>
            <p className="text-4xl font-semibold tracking-tight text-foreground">
              $99<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="size-4 shrink-0 text-success" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <button type="button" className={cn(btnPrimary, 'mt-auto')} onClick={() => toast('info', 'Our sales team will contact you about upgrading.')}>
            Upgrade Plan
          </button>
        </div>
        <div className="flex flex-col gap-5 rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground">Usage This Month</h3>
          <div className="flex flex-col gap-3">
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Messages used this month"
            >
              <div className="h-full rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium tabular-nums text-foreground">
                {`${used.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')} messages`}
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Resets on Nov 1, 2026. You&apos;ll get an alert at 80% usage.
          </p>
          <button type="button" className={cn(btnSecondary, 'mt-auto')} onClick={() => toast('info', 'Invoice history is on its way to your inbox.')}>
            View Invoices
          </button>
        </div>
      </div>
    </div>
  )
}
