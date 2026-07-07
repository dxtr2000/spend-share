<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatMoney } from '@/lib/money'
import type { CurrencyCode, GroupMember, MemberBalance } from '@spend-share/types'

const props = defineProps<{
  balances: MemberBalance[]
  currency: CurrencyCode
  members: GroupMember[]
}>()

defineEmits<{
  selectMember: [memberId: string]
}>()

const memberById = computed(() => new Map(props.members.map((member) => [member.id, member])))
const max = computed(() => Math.max(...props.balances.map((balance) => Math.abs(balance.balanceMinor)), 1))

interface Row {
  member: GroupMember
  balanceMinor: number
  width: number
  positive: boolean
  zero: boolean
}

const rows = computed<Row[]>(() =>
  props.balances.map((balance) => {
    const member = memberById.value.get(balance.memberId)
    return {
      member: member ?? { id: balance.memberId, eventId: '', displayName: 'Unknown', color: '#6C5CE7' },
      balanceMinor: balance.balanceMinor,
      width: Math.max(6, (Math.abs(balance.balanceMinor) / max.value) * 100),
      positive: balance.balanceMinor > 0,
      zero: balance.balanceMinor === 0
    }
  })
)

const allSquare = computed(() => rows.value.every((row) => row.zero))
const { t } = useI18n()
</script>

<template>
  <section class="balances-panel">
    <header class="mb-4 flex min-w-0 items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="balances-panel__title">{{ t('balance.title') }}</h2>
        <p class="balances-panel__subtitle">{{ t('common.peopleCount', { count: members.length }) }}</p>
      </div>
      <span v-if="allSquare" class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">{{ t('balance.allSquare') }}</span>
    </header>

    <div class="grid min-w-0 gap-2">
      <button
        v-for="row in rows"
        :key="row.member.id"
        type="button"
        :aria-label="t('member.detail.open', { name: row.member.displayName })"
        class="balances-panel__row"
        @click="$emit('selectMember', row.member.id)"
      >
        <div class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
            :style="{ backgroundColor: row.member.color }"
          >{{ row.member.displayName.slice(0, 1) }}</span>
          <span class="min-w-0 truncate text-sm font-black">{{ row.member.displayName }}</span>
          <strong
            class="whitespace-nowrap text-right font-mono text-xs font-black"
            :class="row.zero ? 'text-muted' : row.positive ? 'text-emerald-400' : 'text-rose-400'"
            style="font-variant-numeric: tabular-nums"
          >{{ formatMoney(row.balanceMinor, currency) }}</strong>
        </div>
        <div class="relative h-2 min-w-0 overflow-hidden rounded-full bg-background/75">
          <span
            class="absolute top-0 h-full rounded-full"
            :class="row.positive ? 'left-1/2 bg-emerald-500' : 'right-1/2 bg-rose-500'"
            :style="row.zero ? {} : { width: `${row.width / 2}%` }"
          />
          <span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.balances-panel {
  @apply min-w-0 rounded-2xl border border-border/70 bg-card/60 p-5;
}

.balances-panel__title {
  @apply text-sm font-black uppercase tracking-wider text-zinc-300;
}

.balances-panel__subtitle {
  @apply text-xs font-semibold text-zinc-300;
}

.balances-panel__row {
  @apply grid min-w-0 gap-2 rounded-xl bg-cardSoft/45 p-3 text-left transition hover:bg-cardSoft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}
</style>
