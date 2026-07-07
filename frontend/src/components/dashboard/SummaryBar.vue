<script setup lang="ts">
import { computed, type Component } from 'vue'
import { ArrowDown, ArrowUp, BarChart3 } from 'lucide-vue-next'

import { useI18n, type MessageKey } from '@/i18n'
import { formatMoney } from '@/lib/money'
import type { CurrencyCode, MemberBalance } from '@spend-share/types'

type SummaryField = 'youOwe' | 'youAreOwed' | 'total'
interface SummaryCard {
  field: SummaryField
  label: MessageKey
  sub: MessageKey
  icon: Component
}
interface Summary {
  youOwe: number
  youAreOwed: number
  total: number
}

const props = withDefaults(
  defineProps<{
    balances: MemberBalance[]
    currency: CurrencyCode
    totalSpendMinor: number
    youId?: string | null
  }>(),
  { youId: null }
)

const cards: SummaryCard[] = [
  { field: 'youOwe', label: 'summary.youOwe', sub: 'summary.youOweSub', icon: ArrowDown },
  { field: 'youAreOwed', label: 'summary.youAreOwed', sub: 'summary.youAreOwedSub', icon: ArrowUp },
  { field: 'total', label: 'summary.eventTotal', sub: 'summary.eventTotalSub', icon: BarChart3 }
]

const { t } = useI18n()

const summary = computed<Summary>(() => {
  const you = props.balances.find((balance) => balance.memberId === props.youId)
  const net = you?.balanceMinor ?? 0
  return {
    youOwe: Math.abs(Math.min(net, 0)),
    youAreOwed: Math.max(net, 0),
    total: props.totalSpendMinor
  }
})

function value(field: SummaryField) {
  return formatMoney(summary.value[field], props.currency)
}

function cardClasses(field: SummaryField) {
  return field === 'youOwe'
    ? 'border-rose-500/20 bg-rose-500/[0.06]'
    : field === 'youAreOwed'
      ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
      : 'border-border bg-card'
}

function iconClasses(field: SummaryField) {
  return field === 'youOwe'
    ? 'bg-rose-500/15 text-rose-500'
    : field === 'youAreOwed'
      ? 'bg-emerald-500/15 text-emerald-500'
      : 'bg-primary/15 text-primarySoft'
}

function moneyClasses(field: SummaryField) {
  return field === 'youOwe' ? 'text-rose-400' : field === 'youAreOwed' ? 'text-emerald-400' : 'text-foreground'
}
</script>

<template>
  <div class="summary-bar">
    <article
      v-for="card in cards"
      :key="card.field"
      :class="['summary-bar__card', cardClasses(card.field)]"
    >
      <div class="summary-bar__header">
        <span :class="['grid size-8 place-items-center rounded-lg', iconClasses(card.field)]">
          <component :is="card.icon" class="size-4" aria-hidden="true" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="summary-bar__label">{{ t(card.label) }}</p>
          <p class="summary-bar__subtext">{{ t(card.sub) }}</p>
        </div>
      </div>
      <p
        :class="['mt-3 truncate font-mono text-2xl font-black tracking-tight', moneyClasses(card.field)]"
        style="font-variant-numeric: tabular-nums"
      >
        {{ value(card.field) }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.summary-bar {
  @apply grid min-w-0 gap-3 sm:grid-cols-3;
}

.summary-bar__card {
  @apply min-w-0 rounded-2xl border p-4 transition-colors;
}

.summary-bar__header {
  @apply flex min-w-0 items-center gap-2.5;
}

.summary-bar__label {
  @apply text-xs font-black uppercase tracking-wider text-zinc-300;
}

.summary-bar__subtext {
  @apply text-[11px] font-semibold text-zinc-300;
}
</style>
