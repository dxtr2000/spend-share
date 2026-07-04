<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Check } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
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
  <section class="rounded-2xl border border-border/70 bg-card/60 p-5">
    <header class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-black uppercase tracking-wider text-muted">{{ t('settlement.title') }}</h2>
        <p class="text-xs font-semibold text-muted/80">{{ t('settlement.outstanding', { count: settlements.length }) }}</p>
      </div>
    </header>

    <div v-if="settlements.length === 0" class="grid place-items-center gap-2 py-8 text-center">
      <span class="grid size-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
        <Check class="size-5" aria-hidden="true" />
      </span>
      <p class="text-sm font-bold">{{ t('settlement.empty.title') }}</p>
      <p class="text-xs text-muted/80">{{ t('settlement.empty.description') }}</p>
    </div>

    <div v-else class="grid gap-2">
      <article
        v-for="settlement in settlements"
        :key="`${settlement.fromMemberId}-${settlement.toMemberId}-${settlement.amountMinor}`"
        class="flex items-center gap-3 rounded-xl border border-border/80 bg-background/30 p-3"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
            :style="{ backgroundColor: color(settlement.fromMemberId) }"
          >{{ name(settlement.fromMemberId).slice(0, 1) }}</span>
          <span class="truncate text-sm font-bold">{{ name(settlement.fromMemberId) }}</span>
          <ArrowRight class="size-4 shrink-0 text-muted" aria-hidden="true" />
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
            :style="{ backgroundColor: color(settlement.toMemberId) }"
          >{{ name(settlement.toMemberId).slice(0, 1) }}</span>
          <span class="truncate text-sm font-bold">{{ name(settlement.toMemberId) }}</span>
        </div>
        <strong class="font-mono text-sm font-black text-primary" style="font-variant-numeric: tabular-nums">
          {{ formatMoney(settlement.amountMinor, currency) }}
        </strong>
        <Button size="sm" variant="secondary" @click="emit('settle', settlement)">{{ t('action.settle') }}</Button>
      </article>
    </div>
  </section>
</template>
