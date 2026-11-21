'use client'

import { Download, RotateCcw, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, btnSecondary, inputClass } from '../primitives'

export type Filters = {
  status: 'all' | 'active' | 'trial' | 'suspended'
  plan: 'all' | 'free' | 'pro' | 'enterprise'
  channels: 'all' | 'connected' | 'partial' | 'none'
  search: string
}

export const defaultFilters: Filters = { status: 'all', plan: 'all', channels: 'all', search: '' }

export function FiltersBar({
  filters,
  onChange,
  onReset,
  onExport,
}: {
  filters: Filters
  onChange: (f: Filters) => void
  onReset: () => void
  onExport: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <Select
        label="Status"
        hideLabel
        className="w-40"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="trial">Trial</option>
        <option value="suspended">Suspended</option>
      </Select>
      <Select
        label="Plan"
        hideLabel
        className="w-36"
        value={filters.plan}
        onChange={(e) => onChange({ ...filters, plan: e.target.value as Filters['plan'] })}
      >
        <option value="all">All plans</option>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </Select>
      <Select
        label="Channels"
        hideLabel
        className="w-40"
        value={filters.channels}
        onChange={(e) => onChange({ ...filters, channels: e.target.value as Filters['channels'] })}
      >
        <option value="all">All channels</option>
        <option value="connected">Connected</option>
        <option value="partial">Partial</option>
        <option value="none">None</option>
      </Select>
      <div className="relative min-w-56 flex-1">
        <label htmlFor="business-search" className="sr-only">
          Search businesses
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id="business-search"
          type="search"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className={cn(inputClass, 'pl-10')}
        />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onReset} className={cn(btnSecondary, 'h-11 w-11 px-0')} aria-label="Reset filters">
          <RotateCcw className="size-4" />
        </button>
        <button type="button" onClick={onExport} className={cn(btnSecondary, 'h-11')}>
          <Download className="size-4" aria-hidden />
          Export CSV
        </button>
      </div>
    </div>
  )
}
