export type Status = 'active' | 'trial' | 'suspended'
export type Plan = 'free' | 'pro' | 'enterprise'
export type Channels = { instagram: boolean; whatsapp: boolean; telegram: boolean }

export type Business = {
  id: string
  name: string
  industry: string
  country: string
  owner: string
  email: string
  phone: string
  status: Status
  plan: Plan
  channels: Channels
  messages: number
  lastActivityMinutes: number
}

const names = [
  'Aziz Barber Shop', 'Samarkand Grill', 'Nova Retail', 'Luna Beauty Salon', 'MedCare Clinic', 'Urban Fade Studio',
  'Bella Pasta', 'Pixel Gadgets', 'Glow Nail Bar', 'Green Leaf Pharmacy', 'Silk Road Café', 'Tashkent Tailors',
  'Brew & Bean', 'Velvet Spa', 'FitZone Gym', 'Golden Crust Bakery', 'Smile Dental', 'Kraft Furniture',
  'Bloom Florist', 'Swift Auto Care', 'Ocean Sushi', 'Charm Boutique', 'Peak Physio', 'Nomad Travel',
  'Sharp Cuts', 'Maple Kitchen', 'ByteFix Repairs', 'Aura Lashes', 'Harmony Yoga', 'Fresh Mart',
  'Cedar Vet Clinic', 'Lux Optics', 'Crown Barbers', 'Spice Route', 'Echo Music Store', 'Pure Skin Lab',
  'Atlas Bookstore', 'Zen Massage', 'Metro Laundry', 'Coral Seafood', 'Prime Electronics', 'Iris Eye Care',
  'Bolt Bikes', 'Saffron House', 'Oasis Wellness',
]

const industries = ['Barber Shop', 'Restaurant', 'Retail', 'Salon', 'Healthcare', 'Other']
const countries = ['Uzbekistan', 'Kazakhstan', 'Turkey', 'UAE', 'Germany', 'United States', 'United Kingdom']
const owners = [
  'Aziz Karimov', 'Dilnoza Rakhimova', 'Timur Saidov', 'Madina Yusupova', 'Rustam Aliev', 'Sevara Nazarova',
  'Jasur Tursunov', 'Nilufar Ergasheva', 'Bekzod Umarov', 'Kamola Ismoilova', 'Sardor Abdullaev', 'Zarina Khodjaeva',
]
const statuses: Status[] = ['active', 'active', 'active', 'trial', 'active', 'suspended', 'trial']
const plans: Plan[] = ['pro', 'free', 'enterprise', 'pro', 'free', 'pro']

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export const initialBusinesses: Business[] = names.map((name, i) => {
  const owner = owners[i % owners.length]
  const [first, last] = owner.toLowerCase().split(' ')
  const domain = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)
  const channelSeed = Math.floor(rand(i + 3) * 8)
  return {
    id: `biz_${(1000 + i).toString(36)}`,
    name,
    industry: industries[i % industries.length],
    country: countries[i % countries.length],
    owner,
    email: `${first}.${last}@${domain}.com`,
    phone: `+998 9${i % 10} ${String(100 + i * 7).slice(-3)} ${String(10 + i).slice(-2)} ${String(30 + i * 3).slice(-2)}`,
    status: statuses[i % statuses.length],
    plan: plans[i % plans.length],
    channels: {
      instagram: (channelSeed & 1) === 1,
      whatsapp: (channelSeed & 2) === 2,
      telegram: (channelSeed & 4) === 4,
    },
    messages: Math.floor(rand(i + 11) * 230) + 12,
    lastActivityMinutes: Math.floor(rand(i + 29) * 60 * 24 * 9) + 3,
  }
})

export function channelCount(c: Channels) {
  return Number(c.instagram) + Number(c.whatsapp) + Number(c.telegram)
}

export function formatRelative(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export const statusTone = { active: 'success', trial: 'warning', suspended: 'danger' } as const
export const planTone = { free: 'neutral', pro: 'info', enterprise: 'enterprise' } as const
export { industries }
