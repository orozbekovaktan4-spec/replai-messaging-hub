'use client'

import { useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal, Select, btnBase, btnPrimary, btnSecondary, inputClass } from '../primitives'
import { industries, type Business, type Plan } from './data'

const steps = ['Basic Info', 'Contact', 'Setup'] as const

const planOptions: { id: Plan; name: string; price: string; period?: string; features: string[]; popular?: boolean }[] = [
  { id: 'free', name: 'Free', price: '$0', period: '/mo', features: ['1,000 messages/mo', '1 channel', 'Basic support'] },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    features: ['10,000 messages/mo', '3 channels', 'Priority support'],
    popular: true,
  },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited messages', 'All channels', 'Dedicated support'] },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AddBusinessWizard({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (b: Business, sendWelcome: boolean) => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add New Business">
      <WizardBody onClose={onClose} onCreate={onCreate} />
    </Modal>
  )
}

function WizardBody({ onClose, onCreate }: { onClose: () => void; onCreate: (b: Business, w: boolean) => void }) {
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState(false)
  const [form, setForm] = useState({
    name: '',
    industry: industries[0],
    owner: '',
    email: '',
    phone: '',
    plan: 'pro' as Plan,
    sendWelcome: true,
  })
  const ids = { name: useId(), owner: useId(), email: useId(), phone: useId(), welcome: useId() }

  const emailValid = EMAIL_RE.test(form.email)
  const stepValid = [form.name.trim().length > 1, form.owner.trim().length > 1 && emailValid, true][step]

  const next = () => {
    setTouched(true)
    if (!stepValid) return
    setTouched(false)
    setStep((s) => s + 1)
  }

  const submit = () => {
    onCreate(
      {
        id: `biz_${Date.now().toString(36)}`,
        name: form.name.trim(),
        industry: form.industry,
        country: 'Uzbekistan',
        owner: form.owner.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || '—',
        status: form.plan === 'free' ? 'active' : 'trial',
        plan: form.plan,
        channels: { instagram: false, whatsapp: false, telegram: false },
        messages: 0,
        lastActivityMinutes: 0,
      },
      form.sendWelcome,
    )
  }

  const errorClass = 'border-danger focus:border-danger focus:ring-danger/20'

  return (
    <div className="flex flex-col">
      <ol className="flex items-center px-8 pb-2 pt-6" aria-label="Progress">
        {steps.map((label, i) => {
          const done = i < step
          const current = i === step
          return (
            <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-2">
                <span
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                    done && 'bg-brand-gradient text-primary-foreground',
                    current && 'animate-step-pulse bg-brand-gradient text-primary-foreground',
                    !done && !current && 'border border-border bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-4" aria-hidden /> : i + 1}
                </span>
                <span className={cn('text-xs font-medium', current || done ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 mb-6 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-brand-gradient transition-all duration-500"
                    style={{ width: done ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div key={step} className="flex min-h-72 animate-fade-in flex-col gap-5 px-6 py-6">
        {step === 0 && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.name} className="text-sm font-medium text-foreground">
                Business Name <span className="text-danger">*</span>
              </label>
              <input
                id={ids.name}
                className={cn(inputClass, 'h-12 text-base', touched && form.name.trim().length < 2 && errorClass)}
                placeholder="e.g. Aziz Barber Shop"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={touched && form.name.trim().length < 2}
              />
              {touched && form.name.trim().length < 2 && (
                <p className="text-xs text-danger">Please enter a business name.</p>
              )}
            </div>
            <Select label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </Select>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.owner} className="text-sm font-medium text-foreground">
                Owner Name <span className="text-danger">*</span>
              </label>
              <input
                id={ids.owner}
                className={cn(inputClass, touched && form.owner.trim().length < 2 && errorClass)}
                placeholder="Full name"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.email} className="text-sm font-medium text-foreground">
                Email <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  id={ids.email}
                  type="email"
                  className={cn(inputClass, 'pr-10', touched && !emailValid && errorClass)}
                  placeholder="owner@business.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={form.email.length > 0 && !emailValid}
                />
                {form.email.length > 0 &&
                  (emailValid ? (
                    <CircleCheck className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success" aria-label="Valid email" />
                  ) : (
                    <CircleAlert className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-danger" aria-label="Invalid email" />
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={ids.phone} className="text-sm font-medium text-foreground">
                Phone
              </label>
              <input
                id={ids.phone}
                type="tel"
                className={inputClass}
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset className="flex flex-col gap-3">
              <legend className="pb-3 text-sm font-medium text-foreground">Choose a plan</legend>
              <div className="grid grid-cols-3 gap-3">
                {planOptions.map((p) => {
                  const selected = form.plan === p.id
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        'relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.03] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/30',
                        selected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-border hover:border-muted-foreground/40',
                      )}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={selected}
                        onChange={() => setForm({ ...form, plan: p.id })}
                        className="sr-only"
                      />
                      {p.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground">
                          POPULAR
                        </span>
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.name}</span>
                      <span className="text-2xl font-semibold text-foreground">
                        {p.price}
                        {p.period && <span className="text-sm font-normal text-muted-foreground">{p.period}</span>}
                      </span>
                      <ul className="flex flex-col gap-1.5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                            <Check className="mt-0.5 size-3 shrink-0 text-success" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <label htmlFor={ids.welcome} className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
              <input
                id={ids.welcome}
                type="checkbox"
                checked={form.sendWelcome}
                onChange={(e) => setForm({ ...form, sendWelcome: e.target.checked })}
                className="size-4 cursor-pointer rounded accent-primary"
              />
              Send welcome email with login instructions
            </label>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
        {step === 0 ? (
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancel
          </button>
        ) : (
          <button type="button" className={btnSecondary} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" className={btnPrimary} onClick={next}>
            Next
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className={cn(btnBase, 'h-12 bg-brand-gradient px-6 font-semibold text-primary-foreground shadow-lg shadow-brand-to/30 hover:brightness-110')}
            onClick={submit}
          >
            <Check className="size-5" aria-hidden />
            Create Business
          </button>
        )}
      </div>
    </div>
  )
}
