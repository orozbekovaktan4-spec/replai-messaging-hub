'use client'

import { useEffect, useId, useRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const inputClass =
  'h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-all duration-200 hover:border-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20'

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-40'

export const btnPrimary = cn(
  btnBase,
  'h-10 bg-brand-gradient px-4 text-primary-foreground shadow-lg shadow-brand-to/25 hover:brightness-110 hover:shadow-brand-to/40 active:scale-[0.98]',
)

export const btnSecondary = cn(
  btnBase,
  'h-10 border border-border bg-surface px-4 text-foreground hover:bg-secondary active:scale-[0.98]',
)

export const btnDanger = cn(
  btnBase,
  'h-10 bg-danger px-4 text-primary-foreground shadow-lg shadow-danger/25 hover:brightness-110 active:scale-[0.98]',
)

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}>
      {children}
    </div>
  )
}

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'enterprise'

const toneClasses: Record<Tone, string> = {
  success: 'bg-success/12 text-success ring-success/25',
  warning: 'bg-warning/12 text-warning ring-warning/25',
  danger: 'bg-danger/12 text-danger ring-danger/25',
  neutral: 'bg-muted text-muted-foreground ring-border',
  info: 'bg-primary/12 text-primary ring-primary/25',
  enterprise: 'bg-enterprise/12 text-enterprise ring-enterprise/25',
}

export function Badge({ tone, children, dot }: { tone: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        toneClasses[tone],
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}

export function Select({
  className,
  children,
  label,
  hideLabel,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hideLabel?: boolean }) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium text-foreground', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select id={id} className={cn(inputClass, 'cursor-pointer appearance-none pr-9')} {...props}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
          checked ? 'bg-success' : 'bg-input',
        )}
      >
        <span
          className={cn(
            'inline-block size-6 rounded-full bg-primary-foreground shadow-md transition-transform duration-300',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = 'max-w-[600px]',
  hideHeader,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  widthClass?: string
  hideHeader?: boolean
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel?.querySelector<HTMLElement>('input, select, button:not([data-close])')
    focusable?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel) {
        const nodes = panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative w-full animate-modal-in rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-background/80',
          widthClass,
        )}
      >
        {hideHeader ? (
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
        ) : (
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <button
              data-close
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
