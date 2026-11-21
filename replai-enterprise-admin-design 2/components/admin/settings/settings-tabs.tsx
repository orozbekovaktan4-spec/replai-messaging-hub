'use client'

import { useState, type FormEvent } from 'react'
import { useFeedback } from '../feedback-provider'
import { Select, Toggle, btnPrimary, inputClass } from '../primitives'

const fakeSave = () => new Promise((r) => setTimeout(r, 700))

export function TabHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1 border-b border-border pb-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function GeneralTab() {
  const { toast, withLoading } = useFeedback()
  const [name, setName] = useState('REPLAI')

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast('error', 'Platform name cannot be empty.')
      return
    }
    await withLoading(fakeSave)
    toast('success', 'General settings saved.')
  }

  return (
    <form onSubmit={save} className="flex max-w-xl flex-col">
      <TabHeader title="General Settings" description="Basic configuration that applies across the whole platform." />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="platform-name" className="text-sm font-medium text-foreground">
            Platform Name
          </label>
          <input id="platform-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} aria-describedby="platform-name-desc" />
          <p id="platform-name-desc" className="text-xs leading-relaxed text-muted-foreground">
            Shown in emails, the business dashboard, and the browser tab.
          </p>
        </div>
        <Select label="Default Language" defaultValue="en">
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="uz">O‘zbekcha</option>
          <option value="tr">Türkçe</option>
        </Select>
        <Select label="Time Zone" defaultValue="Asia/Tashkent">
          <option value="Asia/Tashkent">(UTC+05:00) Tashkent</option>
          <option value="Asia/Almaty">(UTC+05:00) Almaty</option>
          <option value="Europe/Istanbul">(UTC+03:00) Istanbul</option>
          <option value="Asia/Dubai">(UTC+04:00) Dubai</option>
          <option value="Europe/London">(UTC+00:00) London</option>
          <option value="America/New_York">(UTC-05:00) New York</option>
        </Select>
        <div>
          <button type="submit" className={btnPrimary}>
            Save Changes
          </button>
        </div>
      </div>
    </form>
  )
}

export function SecurityTab() {
  const { toast, withLoading } = useFeedback()
  const [twoFactor, setTwoFactor] = useState(false)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')

  const flip = (setter: (v: boolean) => void, label: string) => (v: boolean) => {
    setter(v)
    toast('info', `${label} ${v ? 'enabled' : 'disabled'}.`)
  }

  const updatePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!current || next.length < 8) {
      toast('error', 'Enter your current password and a new password of at least 8 characters.')
      return
    }
    await withLoading(fakeSave)
    setCurrent('')
    setNext('')
    toast('success', 'Password updated successfully.')
  }

  return (
    <div className="flex max-w-xl flex-col">
      <TabHeader title="Security Settings" description="Protect the super admin account." />
      <div className="flex flex-col divide-y divide-border">
        <Toggle
          label="Two-Factor Authentication"
          description="Require a one-time code from an authenticator app at sign in."
          checked={twoFactor}
          onChange={flip(setTwoFactor, 'Two-factor authentication')}
        />
        <Toggle
          label="Login Notifications"
          description="Get an email whenever a new device signs in to this account."
          checked={loginAlerts}
          onChange={flip(setLoginAlerts, 'Login notifications')}
        />
      </div>

      <form onSubmit={updatePassword} className="mt-8 flex flex-col gap-4 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">Change Password</h3>
        <div className="flex flex-col gap-2">
          <label htmlFor="current-password" className="text-sm font-medium text-foreground">
            Current password
          </label>
          <input id="current-password" type="password" autoComplete="current-password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            New password
          </label>
          <input id="new-password" type="password" autoComplete="new-password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} />
          <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
        </div>
        <div>
          <button type="submit" className={btnPrimary}>
            Update Password
          </button>
        </div>
      </form>
    </div>
  )
}

export function NotificationsTab() {
  const { toast } = useFeedback()
  const [prefs, setPrefs] = useState({ registrations: true, alerts: true, weekly: false })

  const items = [
    { key: 'registrations', label: 'New Business Registration', description: 'When a new business signs up on the platform.' },
    { key: 'alerts', label: 'System Alerts', description: 'Outages, degraded performance, and quota warnings.' },
    { key: 'weekly', label: 'Weekly Reports', description: 'A Monday summary of growth and message volume.' },
  ] as const

  return (
    <div className="flex max-w-xl flex-col">
      <TabHeader title="Notification Preferences" description="Choose which updates land in your inbox." />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Notifications</h3>
      <div className="flex flex-col divide-y divide-border">
        {items.map((i) => (
          <Toggle
            key={i.key}
            label={i.label}
            description={i.description}
            checked={prefs[i.key]}
            onChange={(v) => {
              setPrefs((p) => ({ ...p, [i.key]: v }))
              toast('info', `${i.label} ${v ? 'enabled' : 'disabled'}.`)
            }}
          />
        ))}
      </div>
    </div>
  )
}
