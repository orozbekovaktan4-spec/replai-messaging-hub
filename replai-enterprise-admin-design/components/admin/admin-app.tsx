'use client'

import { useState } from 'react'
import { Monitor } from 'lucide-react'
import { FeedbackProvider } from './feedback-provider'
import { Header } from './header'
import { Sidebar, sections, type SectionId } from './sidebar'
import { BusinessesSection } from './businesses/businesses-section'
import { AnalyticsSection } from './analytics/analytics-section'
import { SettingsSection } from './settings/settings-section'

export function AdminApp() {
  const [section, setSection] = useState<SectionId>('businesses')
  const title = sections.find((s) => s.id === section)?.label ?? ''

  return (
    <FeedbackProvider>
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center md:hidden">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Monitor className="size-7" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Desktop Only</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          The REPLAI admin panel is designed for larger screens. Please open it on a tablet or desktop device.
        </p>
      </div>

      <div className="hidden min-h-svh md:block">
        <Header title={title} />
        <Sidebar active={section} onChange={setSection} />
        <main className="pl-[72px] pt-16 lg:pl-[260px]">
          <div key={section} className="mx-auto max-w-[1440px] animate-fade-in p-8">
            {section === 'businesses' && <BusinessesSection />}
            {section === 'analytics' && <AnalyticsSection />}
            {section === 'settings' && <SettingsSection />}
          </div>
        </main>
      </div>
    </FeedbackProvider>
  )
}
