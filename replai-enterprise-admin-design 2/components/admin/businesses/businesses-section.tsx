'use client'

import { useMemo, useState } from 'react'
import { Building2, HeartPulse, MessagesSquare, Plus, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFeedback } from '../feedback-provider'
import { StatCard, type Stat } from '../stat-card'
import { btnBase } from '../primitives'
import { channelCount, initialBusinesses, type Business } from './data'
import { FiltersBar, defaultFilters, type Filters } from './filters-bar'
import { BusinessTable, type SortKey, type SortState } from './business-table'
import { Pagination } from './pagination'
import { AddBusinessWizard } from './add-business-wizard'
import { BusinessDetailModal } from './business-detail-modal'

const PAGE_SIZE = 10

function sortValue(b: Business, key: SortKey): string | number {
  switch (key) {
    case 'channels':
      return channelCount(b.channels)
    case 'lastActivity':
      return b.lastActivityMinutes
    default:
      return b[key]
  }
}

export function BusinessesSection() {
  const { toast, confirm, withLoading } = useFeedback()
  const [businesses, setBusinesses] = useState(initialBusinesses)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sort, setSort] = useState<SortState>({ key: 'lastActivity', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [detail, setDetail] = useState<{ business: Business; mode: 'view' | 'edit' } | null>(null)

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const result = businesses.filter((b) => {
      if (filters.status !== 'all' && b.status !== filters.status) return false
      if (filters.plan !== 'all' && b.plan !== filters.plan) return false
      const count = channelCount(b.channels)
      if (filters.channels === 'connected' && count !== 3) return false
      if (filters.channels === 'partial' && (count === 0 || count === 3)) return false
      if (filters.channels === 'none' && count !== 0) return false
      if (q && ![b.name, b.email, b.phone, b.owner].some((v) => v.toLowerCase().includes(q))) return false
      return true
    })
    return result.sort((a, b) => {
      const av = sortValue(a, sort.key)
      const bv = sortValue(b, sort.key)
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [businesses, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const totalMessages = businesses.reduce((sum, b) => sum + b.messages, 0)
  const stats: Stat[] = [
    { label: 'Total Businesses', value: businesses.length, trend: '12% vs last month', icon: Building2, tone: 'brand' },
    {
      label: 'Active Today',
      value: 12,
      trend: '5 more than yesterday',
      icon: UserCheck,
      tone: 'success',
    },
    { label: 'Total Messages', value: totalMessages, trend: '24% vs last week', icon: MessagesSquare, tone: 'warning' },
    { label: 'Platform Health', value: 92, suffix: '%', trend: 'Excellent', icon: HeartPulse, tone: 'danger' },
  ]

  const updateFilters = (next: Filters) => {
    setFilters(next)
    setPage(1)
  }

  const handleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const handleDelete = async (b: Business) => {
    const ok = await confirm({
      message: `"${b.name}" and all of its conversations will be permanently deleted. This action cannot be undone.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    setBusinesses((list) => list.filter((x) => x.id !== b.id))
    toast('success', `${b.name} was deleted.`)
  }

  const handleExport = () => {
    const header = ['Name', 'Country', 'Owner', 'Email', 'Phone', 'Status', 'Plan', 'Channels', 'Messages']
    const rows = filtered.map((b) => [
      b.name, b.country, b.owner, b.email, b.phone, b.status, b.plan,
      [b.channels.instagram && 'Instagram', b.channels.whatsapp && 'WhatsApp', b.channels.telegram && 'Telegram']
        .filter(Boolean)
        .join(' | '),
      b.messages,
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'replai-businesses.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('success', `Exported ${filtered.length} businesses to CSV.`)
  }

  const handleCreate = async (b: Business, sendWelcome: boolean) => {
    await withLoading(() => new Promise((r) => setTimeout(r, 900)))
    setBusinesses((list) => [b, ...list])
    setWizardOpen(false)
    setSort({ key: 'lastActivity', dir: 'asc' })
    setPage(1)
    toast('success', `${b.name} created${sendWelcome ? ' — welcome email sent' : ''}.`)
  }

  const handleSave = (b: Business) => {
    setBusinesses((list) => list.map((x) => (x.id === b.id ? b : x)))
    setDetail(null)
    toast('success', `${b.name} updated.`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">Businesses Management</h1>
          <p className="text-sm text-muted-foreground">Onboard, monitor, and manage every business on the platform.</p>
        </div>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className={cn(
            btnBase,
            'h-12 bg-success-gradient px-6 font-semibold text-primary-foreground shadow-lg shadow-success/25 hover:-translate-y-0.5 hover:shadow-success/40 active:translate-y-0',
          )}
        >
          <Plus className="size-5" aria-hidden />
          Add New Business
        </button>
      </div>

      <FiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={() => {
          updateFilters(defaultFilters)
          toast('info', 'Filters reset.')
        }}
        onExport={handleExport}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <BusinessTable
          businesses={pageItems}
          sort={sort}
          onSort={handleSort}
          onView={(business) => setDetail({ business, mode: 'view' })}
          onEdit={(business) => setDetail({ business, mode: 'edit' })}
          onDelete={handleDelete}
        />
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      <AddBusinessWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={handleCreate} />
      <BusinessDetailModal
        state={detail}
        onClose={() => setDetail(null)}
        onSave={handleSave}
        onModeChange={(mode) => setDetail((d) => (d ? { ...d, mode } : d))}
      />
    </div>
  )
}
