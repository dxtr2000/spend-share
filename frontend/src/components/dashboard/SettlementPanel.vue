<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Check, CheckCircle2 } from 'lucide-vue-next'

import { useI18n } from '@/i18n'
import { formatMoney } from '@/lib/money'
import type { CurrencyCode, GroupMember, OptimizedSettlement } from '@spend-share/types'

const props = defineProps<{
  currency: CurrencyCode
  members: GroupMember[]
  settlements: OptimizedSettlement[]
}>()

const emit = defineEmits<{
  settle: [settlement: OptimizedSettlement]
}>()

const memberById = computed(() => new Map(props.members.map((member) => [member.id, member])))
const name = (id: string) => memberById.value.get(id)?.displayName ?? 'Unknown'
const color = (id: string) => memberById.value.get(id)?.color
const { t } = useI18n()
</script>

<template>
  <section class="settlement-panel">
    <header class="settlement-panel__header">
      <div>
        <h2 class="settlement-panel__title">{{ t('settlement.title') }}</h2>
        <p class="settlement-panel__subtitle">{{ t('settlement.outstanding', { count: settlements.length }) }}</p>
      </div>
    </header>

    <div v-if="settlements.length === 0" class="grid place-items-center gap-2 py-8 text-center">
      <span class="grid size-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
        <Check class="size-5" aria-hidden="true" />
      </span>
      <p class="text-sm font-bold">{{ t('settlement.empty.title') }}</p>
      <p class="settlement-panel__empty-text">{{ t('settlement.empty.description') }}</p>
    </div>

    <div v-else class="grid gap-2.5">
      <button
        v-for="settlement in settlements"
        :key="`${settlement.fromMemberId}-${settlement.toMemberId}-${settlement.amountMinor}`"
        type="button"
        class="settlement-panel__item group"
        @click="emit('settle', settlement)"
      >
        <div class="flex min-w-0 items-center gap-2">
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
              :style="{ backgroundColor: color(settlement.fromMemberId) }"
            >{{ name(settlement.fromMemberId).slice(0, 1) }}</span>
            <span class="min-w-0 truncate text-sm font-black text-foreground">{{ name(settlement.fromMemberId) }}</span>
          </div>
          <ArrowRight class="settlement-panel__arrow" aria-hidden="true" />
          <div class="flex min-w-0 items-center gap-2">
            <span
              class="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
              :style="{ backgroundColor: color(settlement.toMemberId) }"
            >{{ name(settlement.toMemberId).slice(0, 1) }}</span>
            <span class="min-w-0 truncate text-sm font-black text-foreground">{{ name(settlement.toMemberId) }}</span>
          </div>
        </div>

        <div class="flex min-w-0 items-center justify-between gap-3 border-t border-border/60 pt-3">
          <strong class="settlement-panel__amount" style="font-variant-numeric: tabular-nums">
            {{ formatMoney(settlement.amountMinor, currency) }}
          </strong>
          <span class="settlement-panel__record-pill">
            <CheckCircle2 class="size-3.5" aria-hidden="true" />
            {{ t('action.recordPayment') }}
          </span>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.settlement-panel {
  @apply min-w-0 rounded-2xl border border-border/70 bg-card/60 p-5;
}

.settlement-panel__header {
  @apply mb-4 flex items-center justify-between gap-3;
}

.settlement-panel__title {
  @apply text-sm font-black uppercase tracking-wider text-zinc-300;
}

.settlement-panel__subtitle,
.settlement-panel__empty-text {
  @apply text-xs font-semibold text-zinc-300;
}

.settlement-panel__item {
  @apply grid min-w-0 gap-3 rounded-xl border border-border/70 bg-cardSoft/45 p-3 text-left transition hover:border-primarySoft/60 hover:bg-cardSoft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}

.settlement-panel__arrow {
  @apply size-4 shrink-0 text-zinc-300;
}

.settlement-panel__amount {
  @apply min-w-0 font-mono text-base font-black text-primarySoft;
}

.settlement-panel__record-pill {
  @apply inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-black text-primarySoft transition group-hover:bg-primary group-hover:text-white;
}
</style>
