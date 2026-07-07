import {
  Bed,
  Camera,
  Car,
  HeartPulse,
  Plane,
  ShoppingBag,
  Ticket,
  Utensils,
  type LucideIcon
} from 'lucide-vue-next'

import type { CurrencyCode } from '@spend-share/types'
import type { MessageKey } from '@/i18n'

export interface CategoryMeta {
  label: string
  icon: LucideIcon
  tint: string
}

export const categoryList: CategoryMeta[] = [
  { label: 'Food & drink', icon: Utensils, tint: 'bg-accent/15 text-accent' },
  { label: 'Accommodation', icon: Bed, tint: 'bg-primary/15 text-primarySoft' },
  { label: 'Transport', icon: Car, tint: 'bg-sky-500/15 text-sky-400' },
  { label: 'Flights', icon: Plane, tint: 'bg-sky-500/15 text-sky-400' },
  { label: 'Sightseeing', icon: Camera, tint: 'bg-emerald-500/15 text-emerald-400' },
  { label: 'Shopping', icon: ShoppingBag, tint: 'bg-fuchsia-500/15 text-fuchsia-400' },
  { label: 'Fees & tickets', icon: Ticket, tint: 'bg-amber-500/15 text-amber-400' },
  { label: 'Health', icon: HeartPulse, tint: 'bg-rose-500/15 text-rose-400' }
]

export const categoryMap = new Map(categoryList.map((category) => [category.label, category]))
const categoryMessageKeys = new Map<string, MessageKey>([
  ['Food & drink', 'category.food'],
  ['Accommodation', 'category.accommodation'],
  ['Transport', 'category.transport'],
  ['Flights', 'category.flights'],
  ['Sightseeing', 'category.sightseeing'],
  ['Shopping', 'category.shopping'],
  ['Fees & tickets', 'category.fees'],
  ['Health', 'category.health']
])

export function categoryOf(label?: string): CategoryMeta {
  return categoryMap.get(label ?? '') ?? categoryList[0]!
}

export function categoryNameKey(label?: string): MessageKey {
  return categoryMessageKeys.get(label ?? '') ?? 'category.food'
}

export const currencyList: CurrencyCode[] = ['USD', 'EUR', 'HUF', 'GBP']

export const currencyOptions = currencyList.map((value) => ({ label: value, value }))
