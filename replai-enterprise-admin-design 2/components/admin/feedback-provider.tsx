'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal, btnDanger, btnSecondary } from './primitives'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; type: ToastType; message: string; leaving: boolean }

type ConfirmOptions = { title?: string; message: string; confirmLabel?: string }

type FeedbackContextValue = {
  toast: (type: ToastType, message: string) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
  withLoading: <T>(task: () => Promise<T>) => Promise<T>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider')
  return ctx
}

const toastStyles: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: TriangleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-primary' },
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null)
  const [loading, setLoading] = useState(false)
  const resolver = useRef<((value: boolean) => void) | null>(null)
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)))
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 300)
  }, [])

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId.current
      setToasts((t) => [...t, { id, type, message, leaving: false }])
      setTimeout(() => dismiss(id), 3000)
    },
    [dismiss],
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setConfirmState(null)
  }, [])

  const withLoading = useCallback(async <T,>(task: () => Promise<T>) => {
    setLoading(true)
    try {
      return await task()
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({ toast, confirm, withLoading }), [toast, confirm, withLoading])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed right-6 top-20 z-[70] flex w-80 flex-col gap-2"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { icon: Icon, className } = toastStyles[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-xl shadow-background/60',
                t.leaving ? 'animate-toast-out' : 'animate-toast-in',
              )}
            >
              <Icon className={cn('mt-0.5 size-4 shrink-0', className)} aria-hidden />
              <p className="flex-1 leading-relaxed">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={confirmState !== null}
        onClose={() => settle(false)}
        title={confirmState?.title ?? 'Are you sure?'}
        widthClass="max-w-[400px]"
        hideHeader
      >
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
            <AlertTriangle className="size-6" aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-foreground">{confirmState?.title ?? 'Are you sure?'}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{confirmState?.message}</p>
          </div>
          <div className="flex w-full gap-3 pt-2">
            <button type="button" className={cn(btnSecondary, 'flex-1')} onClick={() => settle(false)}>
              Cancel
            </button>
            <button type="button" className={cn(btnDanger, 'flex-1')} onClick={() => settle(true)}>
              {confirmState?.confirmLabel ?? 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      {loading && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-sm animate-in fade-in duration-200"
          role="alert"
          aria-busy="true"
        >
          <div className="size-10 animate-spin rounded-full border-[3px] border-border border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}
