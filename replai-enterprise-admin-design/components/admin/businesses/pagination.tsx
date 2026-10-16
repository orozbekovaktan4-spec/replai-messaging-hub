'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const navBtn =
    'flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-foreground transition-all duration-200 hover:bg-secondary disabled:pointer-events-none disabled:opacity-40'

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3"
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{`${from}-${to}`}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button type="button" className={navBtn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              'flex size-9 items-center justify-center rounded-md text-sm font-medium transition-all duration-200',
              p === page
                ? 'bg-brand-gradient text-primary-foreground shadow-md shadow-brand-to/30'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            {p}
          </button>
        ))}
        <button type="button" className={navBtn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      <span className="hidden w-32 lg:block" aria-hidden />
    </nav>
  )
}
