<script setup lang="ts">
import { computed } from 'vue'

import { categoryOf } from '@/features/expenses/categories'
import { useI18n } from '@/i18n'
import { convertMinorCurrency, formatMoney } from '@/lib/money'
import type { CurrencyCode, Expense, GroupMember } from '@spend-share/types'

const props = defineProps<{
  expense: Expense
  currency: CurrencyCode
  members: GroupMember[]
}>()

const { t } = useI18n()

const memberById = computed(() => new Map(props.members.map((member) => [member.id, member])))
const payer = computed(() => memberById.value.get(props.expense.paidByMemberId)?.displayName ?? 'Someone')
const category = computed(() => categoryOf(props.expense.category))
const youShare = computed(() => props.expense.participants.find((participant) => participant.memberId === props.members[0]?.id)?.shareMinor ?? 0)

const convertedMinor = computed(() => {
  if (!props.expense.fxRateToDefault) return null
  return convertMinorCurrency(props.expense.amountMinor, props.expense.currency, props.currency, props.expense.fxRateToDefault)
})

const isDifferentCurrency = computed(() => props.expense.currency !== props.currency)

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`))
}
</script>

<template>
  <article
    class="rounded-xl border border-border bg-card p-4 transition duration-200 focus-within:border-muted/70 focus-within:bg-cardSoft hover:-translate-y-0.5 hover:border-muted/70 hover:bg-cardSoft"
  >
    <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
      <span :class="['grid size-9 shrink-0 place-items-center rounded-lg', category.tint]">
        <component :is="category.icon" class="size-4" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="truncate text-base font-black leading-tight text-foreground">{{ expense.title }}</h3>
        <p class="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-muted">
          <span class="truncate">{{ category.label }}</span>
          <span aria-hidden="true">/</span>
          <span>{{ formatDate(expense.date) }}</span>
        </p>
        <p class="mt-0.5 truncate text-xs font-semibold text-muted">
          {{ t('expense.paidSplit', { payer, count: expense.participants.length }) }}
        </p>
      </div>
      <div class="min-w-24 text-right">
        <p class="font-mono text-lg font-black leading-tight text-foreground" style="font-variant-numeric: tabular-nums">
          {{ formatMoney(expense.amountMinor, expense.currency) }}
        </p>
        <p v-if="isDifferentCurrency && convertedMinor !== null" class="mt-1 text-[11px] font-semibold text-muted/80" style="font-variant-numeric: tabular-nums">
          {{ t('expense.approx', { amount: formatMoney(convertedMinor, props.currency) }) }}
        </p>
        <p v-else class="mt-1 text-[11px] font-semibold text-muted/80">{{ t('expense.yourShare', { amount: formatMoney(youShare, expense.currency) }) }}</p>
      </div>
    </div>

    <div v-if="expense.notes" class="mt-3 border-t border-border/70 pt-2.5 text-xs text-muted">
      {{ expense.notes }}
    </div>
  </article>
</template>
