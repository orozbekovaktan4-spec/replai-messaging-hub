'use client'

import { Activity, Gauge, MessagesSquare, TrendingUp } from 'lucide-react'
import { StatCard, type Stat } from '../stat-card'
import { GrowthChart } from './growth-chart'
import { PlatformChart } from './platform-chart'
import { ActivityFeed } from './activity-feed'

const stats: Stat[] = [
  { label: 'New Signups (30d)', value: 128, trend: '18% vs previous period', icon: TrendingUp, tone: 'brand' },
  { label: 'Messages Processed', value: 248930, trend: '24% vs last week', icon: MessagesSquare, tone: 'success' },
  { label: 'Avg. AI Response', value: 840, suffix: 'ms', trend: '6% slower than target', icon: Gauge, tone: 'warning', trendTone: 'warning' },
  { label: 'Uptime (30d)', value: 99, suffix: '.98%', trend: 'Healthy', icon: Activity, tone: 'danger' },
]

export function AnalyticsSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground">Growth, traffic, and platform health across all businesses.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <GrowthChart />
        <PlatformChart />
      </div>

      <ActivityFeed />
    </div>
  )
}
