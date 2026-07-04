<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, CircleDollarSign, ReceiptText, Trophy, Users } from 'lucide-vue-next'

import { useI18n } from '@/i18n'
import { formatMoney } from '@/lib/money'
import type { AllEventsMemberRanking, AllEventsStatsResponse } from '@spend-share/types'

const props = defineProps<{
  stats: AllEventsStatsResponse
}>()

const { t } = useI18n()

const chartColors = ['#6C5CE7', '#F97316', '#38BDF8', '#34D399', '#F472B6', '#FACC15']

const maxSpend = computed(() => Math.max(...props.stats.events.map((event) => event.expenseTotalMinor), 1))
const maxMembers = computed(() => Math.max(...props.stats.events.map((event) => event.memberCount), 1))
const maxCurrencyTotal = computed(() => Math.max(...props.stats.currencyTotals.map((item) => item.amountMinor), 1))

const topEvent = computed(() =>
  [...props.stats.events].sort((a, b) => b.expenseTotalMinor - a.expenseTotalMinor)[0] ?? null
)

const spendByEvent = computed(() =>
  [...props.stats.events]
    .sort((a, b) => b.expenseTotalMinor - a.expenseTotalMinor)
    .slice(0, 6)
    .map((event, index) => ({
      ...event,
      color: chartColors[index % chartColors.length],
      width: `${Math.max((event.expenseTotalMinor / maxSpend.value) * 100, event.expenseTotalMinor > 0 ? 8 : 0)}%`
    }))
)

const peopleByEvent = computed(() =>
  [...props.stats.events]
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 6)
    .map((event, index) => ({
      ...event,
      color: chartColors[index % chartColors.length],
      width: `${Math.max((event.memberCount / maxMembers.value) * 100, 8)}%`
    }))
)

const currencyBars = computed(() =>
  props.stats.currencyTotals.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    width: `${Math.max((item.amountMinor / maxCurrencyTotal.value) * 100, item.amountMinor > 0 ? 8 : 0)}%`
  }))
)

const topPayers = computed(() =>
  rankingRows((member) => member.paidMinor)
    .filter((member) => member.paidMinor > 0)
    .slice(0, 4)
)

const topShares = computed(() =>
  rankingRows((member) => member.shareMinor)
    .filter((member) => member.shareMinor > 0)
    .slice(0, 4)
)

const mostAhead = computed(() =>
  rankingRows((member) => member.netMinor)
    .filter((member) => member.netMinor > 0)
    .slice(0, 4)
)

function rankingRows(scoreOf: (member: AllEventsMemberRanking) => number) {
  return [...props.stats.memberRankings].sort((a, b) => scoreOf(b) - scoreOf(a))
}

function formatSignedMoney(amountMinor: number, currency: AllEventsMemberRanking['currency']) {
  const sign = amountMinor > 0 ? '+' : amountMinor < 0 ? '-' : ''
  return `${sign}${formatMoney(Math.abs(amountMinor), currency)}`
}
</script>

<template>
  <section class="grid gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article class="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('stats.events') }}</p>
          <BarChart3 class="size-4 text-primary" aria-hidden="true" />
        </div>
        <p class="mt-3 text-3xl font-black tracking-tight">{{ props.stats.totals.eventCount }}</p>
        <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.eventsWithSpend', { count: props.stats.totals.eventsWithSpend }) }}</p>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('stats.expenses') }}</p>
          <ReceiptText class="size-4 text-accent" aria-hidden="true" />
        </div>
        <p class="mt-3 text-3xl font-black tracking-tight">{{ props.stats.totals.expenseCount }}</p>
        <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.expensesRecorded') }}</p>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('stats.people') }}</p>
          <Users class="size-4 text-sky-300" aria-hidden="true" />
        </div>
        <p class="mt-3 text-3xl font-black tracking-tight">{{ props.stats.totals.memberCount }}</p>
        <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.totalMembers') }}</p>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('stats.topEvent') }}</p>
          <Trophy class="size-4 text-amber-300" aria-hidden="true" />
        </div>
        <p class="mt-3 truncate text-xl font-black tracking-tight">{{ topEvent?.name ?? t('stats.noSpendYet') }}</p>
        <p class="mt-1 text-xs font-semibold text-muted">
          {{ topEvent ? formatMoney(topEvent.expenseTotalMinor, topEvent.defaultCurrency) : t('stats.createExpenseFirst') }}
        </p>
      </article>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-black tracking-tight">{{ t('stats.spendByEvent') }}</h2>
            <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.spendByEventSub') }}</p>
          </div>
          <CircleDollarSign class="size-5 text-primary" aria-hidden="true" />
        </div>

        <div class="mt-5 grid gap-3">
          <div v-for="event in spendByEvent" :key="event.id" class="grid gap-1.5">
            <div class="flex items-center justify-between gap-3 text-xs font-bold">
              <span class="truncate text-foreground">{{ event.name }}</span>
              <span class="font-mono text-muted" style="font-variant-numeric: tabular-nums">
                {{ formatMoney(event.expenseTotalMinor, event.defaultCurrency) }}
              </span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-background/80">
              <div class="h-full rounded-full" :style="{ backgroundColor: event.color, width: event.width }" />
            </div>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 class="text-base font-black tracking-tight">{{ t('stats.currencyTotals') }}</h2>
        <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.currencyTotalsSub') }}</p>
        <div class="mt-5 grid gap-3">
          <div v-for="item in currencyBars" :key="item.currency" class="grid gap-1.5">
            <div class="flex items-center justify-between gap-3 text-xs font-bold">
              <span>{{ item.currency }}</span>
              <span class="font-mono text-muted" style="font-variant-numeric: tabular-nums">
                {{ formatMoney(item.amountMinor, item.currency) }}
              </span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-background/80">
              <div class="h-full rounded-full" :style="{ backgroundColor: item.color, width: item.width }" />
            </div>
          </div>
        </div>
      </article>
    </div>

    <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
      <h2 class="text-base font-black tracking-tight">{{ t('stats.peoplePerEvent') }}</h2>
      <p class="mt-1 text-xs font-semibold text-muted">{{ t('stats.peoplePerEventSub') }}</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div v-for="event in peopleByEvent" :key="event.id" class="grid gap-1.5">
          <div class="flex items-center justify-between gap-3 text-xs font-bold">
            <span class="truncate">{{ event.name }}</span>
            <span class="text-muted">{{ t('common.peopleCount', { count: event.memberCount }) }}</span>
          </div>
          <div class="h-2.5 overflow-hidden rounded-full bg-background/80">
            <div class="h-full rounded-full" :style="{ backgroundColor: event.color, width: event.width }" />
          </div>
        </div>
      </div>
    </article>

    <div class="grid gap-4 lg:grid-cols-3">
      <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 class="text-base font-black tracking-tight">{{ t('stats.topPaid') }}</h2>
        <div class="mt-4 grid gap-3">
          <div v-for="member in topPayers" :key="member.id" class="rounded-xl bg-cardSoft p-3">
            <div class="flex items-center gap-3">
              <span class="size-2.5 rounded-full" :style="{ backgroundColor: member.color }" aria-hidden="true" />
              <div class="min-w-0">
                <p class="truncate text-sm font-black">{{ member.displayName }}</p>
                <p class="truncate text-xs font-semibold text-muted">{{ member.eventName }}</p>
              </div>
              <p class="ml-auto font-mono text-sm font-black" style="font-variant-numeric: tabular-nums">
                {{ formatMoney(member.paidMinor, member.currency) }}
              </p>
            </div>
          </div>
          <p v-if="topPayers.length === 0" class="rounded-xl bg-cardSoft p-3 text-sm font-semibold text-muted">
            {{ t('stats.noPaidExpenses') }}
          </p>
        </div>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 class="text-base font-black tracking-tight">{{ t('stats.largestShares') }}</h2>
        <div class="mt-4 grid gap-3">
          <div v-for="member in topShares" :key="member.id" class="rounded-xl bg-cardSoft p-3">
            <div class="flex items-center gap-3">
              <span class="size-2.5 rounded-full" :style="{ backgroundColor: member.color }" aria-hidden="true" />
              <div class="min-w-0">
                <p class="truncate text-sm font-black">{{ member.displayName }}</p>
                <p class="truncate text-xs font-semibold text-muted">{{ member.eventName }}</p>
              </div>
              <p class="ml-auto font-mono text-sm font-black" style="font-variant-numeric: tabular-nums">
                {{ formatMoney(member.shareMinor, member.currency) }}
              </p>
            </div>
          </div>
          <p v-if="topShares.length === 0" class="rounded-xl bg-cardSoft p-3 text-sm font-semibold text-muted">
            {{ t('stats.noSharedExpenses') }}
          </p>
        </div>
      </article>

      <article class="rounded-2xl border border-border/70 bg-card/70 p-5">
        <h2 class="text-base font-black tracking-tight">{{ t('stats.mostAhead') }}</h2>
        <div class="mt-4 grid gap-3">
          <div v-for="member in mostAhead" :key="member.id" class="rounded-xl bg-cardSoft p-3">
            <div class="flex items-center gap-3">
              <span class="size-2.5 rounded-full" :style="{ backgroundColor: member.color }" aria-hidden="true" />
              <div class="min-w-0">
                <p class="truncate text-sm font-black">{{ member.displayName }}</p>
                <p class="truncate text-xs font-semibold text-muted">{{ member.eventName }}</p>
              </div>
              <p class="ml-auto font-mono text-sm font-black text-emerald-300" style="font-variant-numeric: tabular-nums">
                {{ formatSignedMoney(member.netMinor, member.currency) }}
              </p>
            </div>
          </div>
          <p v-if="mostAhead.length === 0" class="rounded-xl bg-cardSoft p-3 text-sm font-semibold text-muted">
            {{ t('stats.noOneAhead') }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
