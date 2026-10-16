'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Badge, Modal, Select, btnPrimary, btnSecondary, inputClass } from '../primitives'
import { ChannelIcons } from './channel-icons'
import { formatRelative, planTone, statusTone, type Business, type Plan, type Status } from './data'

type State = { business: Business; mode: 'view' | 'edit' } | null

export function BusinessDetailModal({
  state,
  onClose,
  onSave,
  onModeChange,
}: {
  state: State
  onClose: () => void
  onSave: (b: Business) => void
  onModeChange: (mode: 'view' | 'edit') => void
}) {
  return (
    <Modal open={state !== null} onClose={onClose} title={state?.mode === 'edit' ? 'Edit Business' : 'Business Details'}>
      {state &&
        (state.mode === 'view' ? (
          <ViewBody business={state.business} onEdit={() => onModeChange('edit')} onClose={onClose} />
        ) : (
          <EditBody key={state.business.id} business={state.business} onSave={onSave} onCancel={onClose} />
        ))}
    </Modal>
  )
}

function ViewBody({ business: b, onEdit, onClose }: { business: Business; onEdit: () => void; onClose: () => void }) {
  const rows = [
    ['Industry', b.industry],
    ['Country', b.country],
    ['Owner', b.owner],
    ['Email', b.email],
    ['Phone', b.phone],
    ['Messages', b.messages.toLocaleString('en-US')],
    ['Last activity', formatRelative(b.lastActivityMinutes)],
  ]
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 p-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-gradient text-xl font-semibold text-primary-foreground" aria-hidden>
          {b.name.charAt(0)}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">{b.name}</p>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[b.status]} dot>
              {b.status}
            </Badge>
            <Badge tone={planTone[b.plan]}>{b.plan}</Badge>
            <ChannelIcons channels={b.channels} />
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border p-6">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="truncate text-sm text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        <button type="button" className={btnSecondary} onClick={onClose}>
          Close
        </button>
        <button type="button" className={btnPrimary} onClick={onEdit}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </button>
      </div>
    </div>
  )
}

function EditBody({ business, onSave, onCancel }: { business: Business; onSave: (b: Business) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(business)
  const set = <K extends keyof Business>(key: K, value: Business[K]) => setDraft((d) => ({ ...d, [key]: value }))

  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        if (draft.name.trim().length < 2) return
        onSave(draft)
      }}
    >
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="col-span-2 flex flex-col gap-2">
          <label htmlFor="edit-name" className="text-sm font-medium text-foreground">
            Business Name
          </label>
          <input id="edit-name" className={inputClass} value={draft.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-owner" className="text-sm font-medium text-foreground">
            Owner
          </label>
          <input id="edit-owner" className={inputClass} value={draft.owner} onChange={(e) => set('owner', e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="edit-email" type="email" className={inputClass} value={draft.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value as Status)}>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select label="Plan" value={draft.plan} onChange={(e) => set('plan', e.target.value as Plan)}>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </Select>
      </div>
      <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          Save Changes
        </button>
      </div>
    </form>
  )
}
