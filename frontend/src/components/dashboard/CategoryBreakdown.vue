<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { convertMinorCurrency, formatMoney } from '@/lib/money'
import type { CurrencyCode, Expense } from '@spend-share/types'
import { categoryOf } from '@/features/expenses/categories'

const props = defineProps<{
  currency: CurrencyCode
  expenses: Expense[]
}>()

const { t } = useI18n()

const rows = computed(() => {
  const totals = new Map<string, number>()
  for (const expense of props.expenses) {
    const label = expense.category ?? 'Food & drink'
    const converted = expense.currency !== props.currency && expense.fxRateToDefault
      ? convertMinorCurrency(expense.amountMinor, expense.currency, props.currency, expense.fxRateToDefault)
      : expense.amountMinor
    totals.set(label, (totals.get(label) ?? 0) + converted)
  }
  const grand = [...totals.values()].reduce((sum, value) => sum + value, 0)
  return [...totals.entries()]
    .map(([label, amountMinor]) => ({
      label,
      amountMinor,
      share: grand > 0 ? Math.round((amountMinor / grand) * 100) : 0,
      meta: categoryOf(label)
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor)
})
</script>

<template>
  <section class="min-w-0 rounded-2xl border border-border/70 bg-card/60 p-5">
    <header class="mb-4">
      <h2 class="text-sm font-black uppercase tracking-wider text-muted">{{ t('category.title') }}</h2>
      <p class="text-xs font-semibold text-muted/80">{{ t('category.subtitle') }}</p>
    </header>

    <div v-if="rows.length === 0" class="py-6 text-center text-xs text-muted">No expenses yet.</div>

    <div v-else class="grid min-w-0 gap-2.5">
      <article v-for="row in rows" :key="row.label" class="flex min-w-0 items-center gap-3 rounded-lg py-1">
        <span :class="['grid size-7 shrink-0 place-items-center rounded-lg', row.meta.tint, 'text-xs']">
          <component :is="row.meta.icon" class="size-3.5" aria-hidden="true" />
        </span>
        <span class="flex-1 truncate text-sm font-bold">{{ row.label }}</span>
        <span class="font-mono text-xs font-semibold text-muted">{{ row.share }}%</span>
        <strong class="w-20 shrink-0 truncate text-right font-mono text-xs font-bold text-foreground" style="font-variant-numeric: tabular-nums">
          {{ formatMoney(row.amountMinor, currency) }}
        </strong>
      </article>
    </div>
  </section>
</template>
