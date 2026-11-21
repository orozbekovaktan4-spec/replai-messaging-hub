'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../primitives'

const data = [
  { name: 'Instagram', value: 98420, color: '#E1306C' },
  { name: 'WhatsApp', value: 112310, color: '#25D366' },
  { name: 'Telegram', value: 38200, color: '#0088cc' },
]

const total = data.reduce((s, d) => s + d.value, 0)

function compact(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function PlatformChart() {
  return (
    <Card className="flex flex-col gap-4 p-6 xl:col-span-2">
      <div>
        <h2 className="text-base font-semibold text-foreground">Messages by Platform</h2>
        <p className="text-sm text-muted-foreground">Share of messages this month</p>
      </div>
      <div className="relative h-56 w-full" role="img" aria-label="Doughnut chart of messages by platform">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={6}
              stroke="none"
              animationDuration={800}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => Number(v).toLocaleString('en-US')}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground">{compact(total)}</span>
          <span className="text-xs text-muted-foreground">Total messages</span>
        </div>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} aria-hidden />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-medium tabular-nums text-foreground">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
