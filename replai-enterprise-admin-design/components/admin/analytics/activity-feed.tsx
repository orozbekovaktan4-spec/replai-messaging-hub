'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpCircle,
  Building2,
  CreditCard,
  Link2,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '../primitives'
import { useFeedback } from '../feedback-provider'

type Item = { id: number; icon: LucideIcon; tone: string; title: string; description: string; time: string }

const seed: Omit<Item, 'id'>[] = [
  { icon: Building2, tone: 'bg-primary/12 text-primary', title: 'New business registered', description: 'Aziz Barber Shop joined on the Pro trial', time: '2h ago' },
  { icon: Link2, tone: 'bg-whatsapp/15 text-whatsapp', title: 'Channel connected', description: 'Samarkand Grill connected WhatsApp Business', time: '3h ago' },
  { icon: ArrowUpCircle, tone: 'bg-enterprise/12 text-enterprise', title: 'Plan upgraded', description: 'MedCare Clinic upgraded to Enterprise', time: '5h ago' },
  { icon: AlertTriangle, tone: 'bg-warning/12 text-warning', title: 'Rate limit warning', description: 'Nova Retail reached 90% of monthly quota', time: '7h ago' },
  { icon: CreditCard, tone: 'bg-success/12 text-success', title: 'Payment received', description: 'Luna Beauty Salon paid $29.00 invoice', time: '9h ago' },
  { icon: UserPlus, tone: 'bg-primary/12 text-primary', title: 'Team member invited', description: 'Urban Fade Studio invited 2 operators', time: '12h ago' },
  { icon: ShieldCheck, tone: 'bg-success/12 text-success', title: 'Security check passed', description: 'Weekly vulnerability scan completed', time: '1d ago' },
  { icon: Link2, tone: 'bg-instagram/15 text-instagram', title: 'Channel connected', description: 'Glow Nail Bar connected Instagram DMs', time: '1d ago' },
]

const incoming: Omit<Item, 'id' | 'time'>[] = [
  { icon: Building2, tone: 'bg-primary/12 text-primary', title: 'New business registered', description: 'Silk Road Café started a Free plan' },
  { icon: Link2, tone: 'bg-telegram/15 text-telegram', title: 'Channel connected', description: 'Bolt Bikes connected a Telegram bot' },
  { icon: CreditCard, tone: 'bg-success/12 text-success', title: 'Payment received', description: 'Crown Barbers paid $29.00 invoice' },
]

export function ActivityFeed() {
  const { toast } = useFeedback()
  const [items, setItems] = useState<Item[]>(() => seed.map((s, i) => ({ ...s, id: i })))
  const [spinning, setSpinning] = useState(false)
  const [newestId, setNewestId] = useState<number | null>(null)

  const refresh = () => {
    setSpinning(true)
    setTimeout(() => {
      const id = items.reduce((m, x) => Math.max(m, x.id), 0) + 1
      setNewestId(id)
      setItems([{ ...incoming[id % incoming.length], id, time: 'Just now' }, ...items].slice(0, 10))
      setSpinning(false)
      toast('info', 'Activity feed updated.')
    }, 600)
  }

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
        <button
          type="button"
          onClick={refresh}
          disabled={spinning}
          aria-label="Refresh activity"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw className={cn('size-4', spinning && 'animate-spin')} />
        </button>
      </div>
      <ul aria-live="polite">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-4 border-b border-border px-6 py-4 transition-colors duration-200 last:border-b-0 hover:bg-muted/50',
                item.id === newestId && 'animate-fade-in',
              )}
            >
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', item.tone)}>
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="truncate text-sm text-muted-foreground">{item.description}</p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">{item.time}</time>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
