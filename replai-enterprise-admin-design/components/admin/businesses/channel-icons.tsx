import { Camera, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Channels } from './data'

const items = [
  { key: 'instagram', label: 'Instagram', icon: Camera, on: 'bg-instagram/15 text-instagram' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, on: 'bg-whatsapp/15 text-whatsapp' },
  { key: 'telegram', label: 'Telegram', icon: Send, on: 'bg-telegram/15 text-telegram' },
] as const

export function ChannelIcons({ channels }: { channels: Channels }) {
  return (
    <ul className="flex items-center gap-1.5">
      {items.map(({ key, label, icon: Icon, on }) => {
        const connected = channels[key]
        return (
          <li
            key={key}
            title={`${label}: ${connected ? 'connected' : 'not connected'}`}
            className={cn(
              'flex size-7 items-center justify-center rounded-md transition-colors',
              connected ? on : 'bg-muted text-muted-foreground/50',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="sr-only">{`${label} ${connected ? 'connected' : 'not connected'}`}</span>
          </li>
        )
      })}
    </ul>
  )
}
