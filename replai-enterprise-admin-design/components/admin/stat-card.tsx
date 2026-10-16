'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

export type Stat = {
  label: string
  value: number
  suffix?: string
  trend: string
  icon: LucideIcon
  tone: 'brand' | 'success' | 'warning' | 'danger'
  trendTone?: 'success' | 'warning' | 'danger'
}

const iconTone = {
  brand: 'bg-primary/12 text-primary',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
}

const trendTone = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

export function StatCard({ stat }: { stat: Stat }) {
  const count = useCountUp(stat.value)
  const Icon = stat.icon
  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
        <div className={cn('flex size-10 items-center justify-center rounded-lg', iconTone[stat.tone])}>
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {count.toLocaleString('en-US')}
        {stat.suffix}
      </p>
      <p className={cn('flex items-center gap-1 text-xs font-medium', trendTone[stat.trendTone ?? 'success'])}>
        <ArrowUpRight className="size-3.5" aria-hidden />
        {stat.trend}
      </p>
    </div>
  )
}
