<script setup lang="ts">
import { BarChart3, CalendarDays, Plus, Users } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import { useI18n } from '@/i18n'
import { formatMoney } from '@/lib/money'
import type { EventSummary } from '@spend-share/types'

const props = defineProps<{
  events: EventSummary[]
}>()

const { t } = useI18n()

defineEmits<{
  openEvent: [eventId: string]
  newEvent: []
  viewStats: []
}>()

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date)
  )
}
</script>

<template>
  <section class="grid gap-4">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-black tracking-tight">{{ t('events.title') }}</h1>
        <p class="text-sm font-semibold text-muted">{{ t('events.description') }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Button v-if="props.events.length > 0" variant="secondary" size="sm" @click="$emit('viewStats')">
          <BarChart3 class="size-4" aria-hidden="true" />
          {{ t('action.stats') }}
        </Button>
        <Button variant="primary" size="sm" @click="$emit('newEvent')">
          <Plus class="size-4" aria-hidden="true" />
          {{ t('action.newEvent') }}
        </Button>
      </div>
    </header>

    <div v-if="props.events.length === 0" class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span class="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
        <CalendarDays class="size-6" aria-hidden="true" />
      </span>
      <p class="text-base font-bold">{{ t('event.empty.title') }}</p>
      <p class="max-w-xs text-sm text-muted">{{ t('event.empty.description') }}</p>
      <Button variant="secondary" size="sm" class="mt-1" @click="$emit('newEvent')">
        <Plus class="size-4" aria-hidden="true" />
        {{ t('action.createEvent') }}
      </Button>
    </div>

    <div v-else class="grid gap-4">
      <TransitionGroup name="list" tag="div" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="event in props.events"
          :key="event.id"
          type="button"
          class="group grid gap-3 rounded-2xl border border-border bg-card p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-cardSoft active:translate-y-0"
          @click="$emit('openEvent', event.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <CalendarDays class="size-5" aria-hidden="true" />
            </span>
            <span class="rounded-lg bg-cardSoft px-2 py-1 text-xs font-bold text-muted">{{ event.defaultCurrency }}</span>
          </div>
          <div>
            <h3 class="text-lg font-black tracking-tight group-hover:text-primary">{{ event.name }}</h3>
            <p class="mt-0.5 text-xs font-semibold text-muted">{{ formatDate(event.createdAt) }}</p>
          </div>
          <div class="flex items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted">
            <span class="inline-flex items-center gap-1.5">
              <Users class="size-3.5" aria-hidden="true" />
              {{ t('common.peopleCount', { count: event.memberCount }) }}
            </span>
            <span class="ml-auto font-mono font-bold text-foreground" style="font-variant-numeric: tabular-nums">
              {{ formatMoney(event.expenseTotalMinor, event.defaultCurrency) }}
            </span>
          </div>
        </button>
      </TransitionGroup>
    </div>
  </section>
</template>
