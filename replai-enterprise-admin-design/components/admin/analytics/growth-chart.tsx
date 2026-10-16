'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, Select } from '../primitives'

const ranges = { '7': 'Last 7 days', '30': 'Last 30 days', '90': 'Last 90 days' } as const
type Range = keyof typeof ranges

function buildSeries(days: number) {
  const today = new Date(2026, 9, 12)
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    const base = 2 + i * (12 / days)
    const wave = Math.sin(i * 0.9) * 1.6 + Math.cos(i * 0.37) * 1.2
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: Math.max(1, Math.round(base + wave + 2)),
    }
  })
}

export function GrowthChart() {
  const [range, setRange] = useState<Range>('30')
  const data = useMemo(() => buildSeries(Number(range)), [range])

  return (
    <Card className="flex flex-col gap-4 p-6 xl:col-span-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Business Growth</h2>
          <p className="text-sm text-muted-foreground">New business registrations</p>
        </div>
        <Select label="Date range" hideLabel className="w-40" value={range} onChange={(e) => setRange(e.target.value as Range)}>
          {Object.entries(ranges).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div className="h-72 w-full" role="img" aria-label={`Line chart of business registrations over the ${ranges[range].toLowerCase()}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0061ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#60efff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="growthStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60efff" />
                <stop offset="100%" stopColor="#0061ff" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              minTickGap={24}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: 'var(--border)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--popover-foreground)',
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
            />
            <Area
              type="monotone"
              dataKey="registrations"
              name="Registrations"
              stroke="url(#growthStroke)"
              strokeWidth={2.5}
              fill="url(#growthFill)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
