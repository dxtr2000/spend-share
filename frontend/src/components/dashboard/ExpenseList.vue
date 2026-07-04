<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Inbox, Plus, Search, X } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import ExpenseRow from '@/components/dashboard/ExpenseRow.vue'
import Input from '@/components/ui/Input.vue'
import { useI18n, type MessageKey } from '@/i18n'
import type { CurrencyCode, Expense, GroupMember } from '@spend-share/types'

type Filter = 'all' | 'paid' | 'shared'

const props = defineProps<{
  currency: CurrencyCode
  expenses: Expense[]
  members: GroupMember[]
  youId?: string | null
}>()

defineEmits<{
  addExpense: []
  deleteExpense: [expense: Expense]
  editExpense: [expense: Expense]
}>()

const filter = shallowRef<Filter>('all')
const query = shallowRef('')
const { t } = useI18n()

const memberById = computed(() => new Map(props.members.map((member) => [member.id, member.displayName])))
const hasActiveFilters = computed(() => query.value.trim() !== '' || filter.value !== 'all')
const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return props.expenses.filter((expense) => {
    const payer = memberById.value.get(expense.paidByMemberId) ?? ''
    const matchesTerm =
      !term ||
      expense.title.toLowerCase().includes(term) ||
      expense.category?.toLowerCase().includes(term) ||
      payer.toLowerCase().includes(term) ||
      expense.notes?.toLowerCase().includes(term)
    if (!matchesTerm) return false
    if (filter.value === 'paid') return expense.paidByMemberId === props.youId
    if (filter.value === 'shared') return expense.participants.some((participant) => participant.memberId === props.youId)
    return true
  })
})

const filters: { label: MessageKey; value: Filter }[] = [
  { label: 'expense.filter.all', value: 'all' },
  { label: 'expense.filter.paid', value: 'paid' },
  { label: 'expense.filter.shared', value: 'shared' }
]

function clearFilters() {
  query.value = ''
  filter.value = 'all'
}
</script>

<template>
  <section class="grid min-w-0 gap-3">
    <header class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-black tracking-tight">{{ t('expense.title') }}</h2>
        <p class="mt-0.5 text-xs font-semibold text-muted">{{ t('expense.shown', { shown: filtered.length, total: expenses.length }) }}</p>
      </div>
      <Button variant="primary" size="sm" @click="$emit('addExpense')">
        <Plus class="size-4" aria-hidden="true" />
        {{ t('action.add') }}
      </Button>
    </header>

    <div class="grid min-w-0 gap-2 rounded-2xl border border-border bg-cardSoft p-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <label class="relative block">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <Input id="expense-search" v-model="query" class="border-transparent bg-card pl-10 pr-12" :placeholder="t('expense.search')" />
        <Button
          v-if="query"
          variant="ghost"
          size="icon"
          class="absolute right-1.5 top-1/2 size-8 min-h-8 -translate-y-1/2 rounded-lg border-transparent bg-transparent"
          aria-label="Clear search"
          @click="query = ''"
        >
          <X class="size-4" aria-hidden="true" />
        </Button>
      </label>

      <div class="grid min-w-0 grid-cols-3 gap-1 rounded-xl bg-card p-1">
        <Button
          v-for="item in filters"
          :key="item.value"
          :variant="filter === item.value ? 'navActive' : 'ghost'"
          size="sm"
          class="min-w-0"
          @click="filter = item.value"
        >
          <span class="truncate">{{ t(item.label) }}</span>
        </Button>
      </div>
    </div>

    <TransitionGroup v-if="filtered.length > 0" name="list" tag="div" class="relative grid gap-2">
      <ExpenseRow
        v-for="expense in filtered"
        :key="expense.id"
        :currency="currency"
        :expense="expense"
        :members="members"
        @delete-expense="$emit('deleteExpense', $event)"
        @edit-expense="$emit('editExpense', $event)"
      />
    </TransitionGroup>

    <Transition v-else name="surface" mode="out-in">
      <div key="empty-expenses" class="grid place-items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
        <Inbox class="size-6 text-muted/70" aria-hidden="true" />
        <span class="text-sm font-semibold text-muted">{{ t('expense.emptyMatch') }}</span>
        <Button v-if="hasActiveFilters" variant="ghost" size="sm" class="mt-1" @click="clearFilters">{{ t('action.cancel') }}</Button>
      </div>
    </Transition>
  </section>
</template>
