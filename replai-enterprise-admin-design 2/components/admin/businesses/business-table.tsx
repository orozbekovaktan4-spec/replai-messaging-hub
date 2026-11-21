'use client'

import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, SearchX, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '../primitives'
import { ChannelIcons } from './channel-icons'
import { formatRelative, planTone, statusTone, type Business } from './data'

export type SortKey = 'name' | 'owner' | 'status' | 'plan' | 'channels' | 'messages' | 'lastActivity'
export type SortState = { key: SortKey; dir: 'asc' | 'desc' }

const columns: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'name', label: 'Business' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'plan', label: 'Plan' },
  { key: 'channels', label: 'Channels' },
  { key: 'messages', label: 'Messages', align: 'right' },
  { key: 'lastActivity', label: 'Last Activity' },
]

export function BusinessTable({
  businesses,
  sort,
  onSort,
  onView,
  onEdit,
  onDelete,
}: {
  businesses: Business[]
  sort: SortState
  onSort: (key: SortKey) => void
  onView: (b: Business) => void
  onEdit: (b: Business) => void
  onDelete: (b: Business) => void
}) {
  return (
    <div className="max-h-[640px] overflow-auto">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
          <tr className="border-b border-border">
            {columns.map((c) => {
              const active = sort.key === c.key
              const SortIcon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cn('whitespace-nowrap px-3 py-3 font-semibold', c.align === 'right' ? 'text-right' : 'text-left')}
                >
                  <button
                    type="button"
                    onClick={() => onSort(c.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded text-[11px] uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {c.label}
                    <SortIcon className="size-3" aria-hidden />
                  </button>
                </th>
              )
            })}
            <th scope="col" className="whitespace-nowrap px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {businesses.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <SearchX className="size-8" aria-hidden />
                  <p className="text-sm font-medium text-foreground">No businesses match your filters</p>
                  <p className="text-sm">Try adjusting the filters or search query.</p>
                </div>
              </td>
            </tr>
          )}
          {businesses.map((b) => (
            <tr
              key={b.id}
              className="group border-b border-border transition-all duration-200 last:border-b-0 even:bg-muted/40 hover:bg-accent/60 hover:shadow-[0_-1px_0_0_var(--border),0_4px_12px_-6px_rgb(0_0_0/0.2)]"
            >
              <td className="px-3 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-primary-foreground"
                    aria-hidden
                  >
                    {b.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{b.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.country}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4">
                <p className="text-foreground">{b.owner}</p>
                <p className="max-w-44 truncate text-xs text-muted-foreground">{b.email}</p>
              </td>
              <td className="px-3 py-4">
                <Badge tone={statusTone[b.status]} dot>
                  {b.status}
                </Badge>
              </td>
              <td className="px-3 py-4">
                <Badge tone={planTone[b.plan]}>{b.plan}</Badge>
              </td>
              <td className="px-3 py-4">
                <ChannelIcons channels={b.channels} />
              </td>
              <td className="px-3 py-4 text-right font-medium tabular-nums text-foreground">
                {b.messages.toLocaleString('en-US')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-muted-foreground">{formatRelative(b.lastActivityMinutes)}</td>
              <td className="px-3 py-4">
                <div className="flex items-center justify-end gap-0.5">
                  <ActionButton label={`View ${b.name}`} onClick={() => onView(b)}>
                    <Eye className="size-4" />
                  </ActionButton>
                  <ActionButton label={`Edit ${b.name}`} onClick={() => onEdit(b)}>
                    <Pencil className="size-4" />
                  </ActionButton>
                  <ActionButton label={`Delete ${b.name}`} onClick={() => onDelete(b)} danger>
                    <Trash2 className="size-4" />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        danger ? 'hover:bg-danger/12 hover:text-danger' : 'hover:bg-primary/12 hover:text-primary',
      )}
    >
      {children}
    </button>
  )
}
