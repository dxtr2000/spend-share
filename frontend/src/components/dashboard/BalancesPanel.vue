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
  <section class="rounded-2xl border border-border/70 bg-card/60 p-5">
    <header class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-black uppercase tracking-wider text-muted">{{ t('balance.title') }}</h2>
        <p class="text-xs font-semibold text-muted/80">{{ t('common.peopleCount', { count: members.length }) }}</p>
      </div>
      <span v-if="allSquare" class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">{{ t('balance.allSquare') }}</span>
    </header>

    <div class="grid gap-2.5">
      <article v-for="row in rows" :key="row.member.id" class="flex items-center gap-3">
        <span
          class="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
          :style="{ backgroundColor: row.member.color }"
        >{{ row.member.displayName.slice(0, 1) }}</span>
        <span class="w-16 shrink-0 truncate text-sm font-bold">{{ row.member.displayName }}</span>
        <div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-background/70">
          <span
            class="absolute top-0 h-full rounded-full"
            :class="row.positive ? 'left-1/2 bg-emerald-500' : 'right-1/2 bg-rose-500'"
            :style="row.zero ? {} : { width: `${row.width / 2}%` }"
          />
          <span class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
        </div>
        <strong
          class="w-16 shrink-0 text-right font-mono text-xs font-bold"
          :class="row.zero ? 'text-muted' : row.positive ? 'text-emerald-400' : 'text-rose-400'"
          style="font-variant-numeric: tabular-nums"
        >{{ formatMoney(row.balanceMinor, currency) }}</strong>
      </article>
    </div>
  </section>
</template>
