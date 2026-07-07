<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Copy, Pencil, Trash2 } from 'lucide-vue-next'

import { categoryNameKey, categoryOf } from '@/features/expenses/categories'
import { useI18n } from '@/i18n'
import { convertMinorCurrency, formatMoney } from '@/lib/money'
import type { CurrencyCode, Expense, GroupMember } from '@spend-share/types'

const props = defineProps<{
  expense: Expense
  currency: CurrencyCode
  members: GroupMember[]
}>()

const emit = defineEmits<{
  deleteExpense: [expense: Expense]
  duplicateExpense: [expense: Expense]
  editExpense: [expense: Expense]
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
const dragStartX = shallowRef<number | null>(null)
const dragX = shallowRef(0)
const isTouchDragging = shallowRef(false)
const rowStyle = computed(() => ({ transform: `translateX(${dragX.value}px)` }))

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`))
}

function startSwipe(event: PointerEvent) {
  if (event.pointerType !== 'touch') return
  const target = event.target
  if (target instanceof HTMLElement && target.closest('button')) return
  dragStartX.value = event.clientX
  isTouchDragging.value = true
}

function moveSwipe(event: PointerEvent) {
  if (!isTouchDragging.value || dragStartX.value === null) return
  const delta = event.clientX - dragStartX.value
  dragX.value = Math.max(-88, Math.min(88, delta))
}

function endSwipe() {
  if (!isTouchDragging.value) return
  if (dragX.value > 72) emit('editExpense', props.expense)
  if (dragX.value < -72) emit('deleteExpense', props.expense)
  dragStartX.value = null
  isTouchDragging.value = false
  dragX.value = 0
}
</script>

<template>
  <div
    class="expense-row"
    @pointercancel="endSwipe"
    @pointerdown="startSwipe"
    @pointermove="moveSwipe"
    @pointerup="endSwipe"
  >
    <div class="expense-row__swipe-action expense-row__swipe-action--edit">
      {{ t('action.edit') }}
    </div>
    <div class="expense-row__swipe-action expense-row__swipe-action--delete">
      {{ t('action.delete') }}
    </div>
    <article
      class="expense-row__card group"
      :style="rowStyle"
    >
    <div class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
      <span :class="['grid size-9 shrink-0 place-items-center rounded-lg', category.tint]">
        <component :is="category.icon" class="size-4" aria-hidden="true" />
      </span>

      <div class="min-w-0">
        <h3 class="truncate text-base font-black leading-tight text-foreground">{{ expense.title }}</h3>
        <p class="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-muted">
          <span class="truncate">{{ t(categoryNameKey(category.label)) }}</span>
          <span aria-hidden="true">/</span>
          <span>{{ formatDate(expense.date) }}</span>
        </p>
        <p class="mt-0.5 truncate text-xs font-semibold text-muted">
          {{ t('expense.paidSplit', { payer, count: expense.participants.length }) }}
        </p>
      </div>

      <div class="col-span-2 flex min-w-0 items-end justify-between gap-3 border-t border-border/70 pt-3 sm:col-span-1 sm:grid sm:border-t-0 sm:pt-0 sm:justify-items-end sm:text-right">
        <div class="min-w-0">
          <p class="whitespace-nowrap font-mono text-lg font-black leading-tight text-foreground" style="font-variant-numeric: tabular-nums">
          {{ formatMoney(expense.amountMinor, expense.currency) }}
          </p>
          <p v-if="isDifferentCurrency && convertedMinor !== null" class="expense-row__supporting-money" style="font-variant-numeric: tabular-nums">
            {{ t('expense.approx', { amount: formatMoney(convertedMinor, props.currency) }) }}
          </p>
          <p v-else class="expense-row__supporting-money">{{ t('expense.yourShare', { amount: formatMoney(youShare, expense.currency) }) }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-cardSoft/70 p-0.5 sm:opacity-70 sm:transition sm:group-hover:opacity-100">
          <button
            type="button"
            class="expense-row__icon-button"
            :aria-label="t('action.duplicate')"
            @click="emit('duplicateExpense', expense)"
          >
            <Copy class="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="expense-row__icon-button"
            :aria-label="t('action.edit')"
            @click="emit('editExpense', expense)"
          >
            <Pencil class="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="expense-row__icon-button expense-row__icon-button--danger"
            :aria-label="t('action.delete')"
            @click="emit('deleteExpense', expense)"
          >
            <Trash2 class="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="expense.notes" class="mt-3 border-t border-border/70 pt-2.5 text-xs text-muted">
      {{ expense.notes }}
    </div>
    </article>
  </div>
</template>

<style scoped>
.expense-row {
  @apply relative min-w-0 overflow-hidden rounded-xl;
}

.expense-row__swipe-action {
  @apply pointer-events-none absolute inset-y-0 flex w-24 items-center px-4 text-xs font-black;
}

.expense-row__swipe-action--edit {
  @apply left-0 bg-emerald-500/15 text-emerald-300;
}

.expense-row__swipe-action--delete {
  @apply right-0 justify-end bg-rose-500/15 text-rose-300;
}

.expense-row__card {
  @apply relative min-w-0 rounded-xl border border-border bg-card p-4 transition duration-200 focus-within:border-muted/70 focus-within:bg-cardSoft hover:-translate-y-0.5 hover:border-muted/70 hover:bg-cardSoft;
}

.expense-row__supporting-money {
  @apply mt-1 whitespace-nowrap text-[11px] font-semibold text-zinc-300;
}

.expense-row__icon-button {
  @apply grid size-8 place-items-center rounded-md text-zinc-300 transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}

.expense-row__icon-button--danger {
  @apply hover:bg-rose-500/15 hover:text-rose-300;
}
</style>
