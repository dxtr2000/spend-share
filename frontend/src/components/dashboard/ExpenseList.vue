<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Inbox, Plus, Search, X } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import ExpenseRow from '@/components/dashboard/ExpenseRow.vue'
import Input from '@/components/ui/Input.vue'
import { categoryNameKey } from '@/features/expenses/categories'
import { useI18n, type MessageKey } from '@/i18n'
import type { CurrencyCode, Expense, GroupMember } from '@spend-share/types'

type Filter = 'all' | 'paid' | 'shared'

const props = defineProps<{
  categoryFilter?: string | null
  currency: CurrencyCode
  expenses: Expense[]
  members: GroupMember[]
  youId?: string | null
}>()

const emit = defineEmits<{
  addExpense: []
  deleteExpense: [expense: Expense]
  duplicateExpense: [expense: Expense]
  editExpense: [expense: Expense]
  clearCategoryFilter: []
}>()

const filter = shallowRef<Filter>('all')
const query = shallowRef('')
const { t } = useI18n()

const memberById = computed(() => new Map(props.members.map((member) => [member.id, member.displayName])))
const hasActiveFilters = computed(() => query.value.trim() !== '' || filter.value !== 'all' || Boolean(props.categoryFilter))
const categoryFilterLabel = computed(() => (props.categoryFilter ? t(categoryNameKey(props.categoryFilter)) : ''))
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
    if (props.categoryFilter && (expense.category ?? 'Food & drink') !== props.categoryFilter) return false
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
  emit('clearCategoryFilter')
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

    <div class="grid min-w-0 gap-2">
      <label class="relative block">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <Input id="expense-search" v-model="query" autocomplete="off" class="min-h-11 border-border/70 bg-cardSoft/60 pl-10 pr-12" name="expense-search" :placeholder="t('expense.search')" />
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

      <div class="flex min-w-0 flex-wrap gap-2">
        <Button
          v-for="item in filters"
          :key="item.value"
          :variant="filter === item.value ? 'primary' : 'secondary'"
          size="sm"
          class="min-h-9 rounded-full px-3.5"
          @click="filter = item.value"
        >
          <span class="truncate">{{ t(item.label) }}</span>
        </Button>
      </div>

      <div v-if="categoryFilter" class="expense-list__category-filter">
        <span class="min-w-0 truncate">{{ t('expense.filteredByCategory', { category: categoryFilterLabel }) }}</span>
        <Button variant="ghost" size="icon" class="ml-auto size-7 min-h-7 rounded-lg border-transparent bg-transparent text-primarySoft" :aria-label="t('action.clear')" @click="$emit('clearCategoryFilter')">
          <X class="size-4" aria-hidden="true" />
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
        @duplicate-expense="$emit('duplicateExpense', $event)"
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

<style scoped>
.expense-list__category-filter {
  @apply flex min-w-0 items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-bold text-primarySoft;
}
</style>
