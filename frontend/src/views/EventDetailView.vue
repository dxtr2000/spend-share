<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { CalendarDays, Copy, Crown, Plus, ReceiptText, Sparkles, Users, Wifi, WifiOff } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import ExpenseList from '@/components/dashboard/ExpenseList.vue'
import SummaryBar from '@/components/dashboard/SummaryBar.vue'
import SettlementPanel from '@/components/dashboard/SettlementPanel.vue'
import BalancesPanel from '@/components/dashboard/BalancesPanel.vue'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown.vue'
import EventDetailSkeleton from '@/components/dashboard/EventDetailSkeleton.vue'
import ExpenseDialog from '@/features/expenses/ExpenseDialog.vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { useSpendShareStore } from '@/stores/spendShare'
import { convertMinorCurrency, formatMoney } from '@/lib/money'
import type { CreateExpensePayload, CurrencyCode, GroupMember, OptimizedSettlement } from '@spend-share/types'
import type { Expense } from '@spend-share/types'

const route = useRoute()
const router = useRouter()
const store = useSpendShareStore()
const { showToast } = useToast()
const { t } = useI18n()

const isExpenseDialogOpen = shallowRef(false)
const isLoadingCurrent = shallowRef(true)
const loadError = shallowRef(false)
const editingExpense = shallowRef<Expense | null>(null)
const expenseDialogMode = shallowRef<'create' | 'edit' | 'duplicate'>('create')
const selectedCategory = shallowRef<string | null>(null)
const selectedMemberId = shallowRef<string | null>(null)
const isOnline = shallowRef(typeof navigator === 'undefined' ? true : navigator.onLine)

const eventId = computed(() => route.params.eventId as string | undefined)
const currency = computed<CurrencyCode>(() => store.activeEvent?.defaultCurrency ?? 'USD')
const youId = computed(() => store.members[0]?.id ?? null)
const hasExpenses = computed(() => store.expenses.length > 0)
const selectedMember = computed(() => store.members.find((member) => member.id === selectedMemberId.value) ?? null)
const selectedMemberBalance = computed(() => store.memberBalances.find((balance) => balance.memberId === selectedMemberId.value)?.balanceMinor ?? 0)
const selectedMemberPaid = computed(() =>
  store.expenses
    .filter((expense) => expense.paidByMemberId === selectedMemberId.value)
    .reduce((sum, expense) => sum + convertedExpenseAmount(expense), 0)
)
const selectedMemberShare = computed(() =>
  store.expenses.reduce((sum, expense) => {
    const participant = expense.participants.find((item) => item.memberId === selectedMemberId.value)
    if (!participant) return sum
    if (expense.currency === currency.value || !expense.fxRateToDefault) return sum + participant.shareMinor
    return sum + convertMinorCurrency(participant.shareMinor, expense.currency, currency.value, expense.fxRateToDefault)
  }, 0)
)
const selectedMemberNetLabel = computed(() => {
  if (selectedMemberBalance.value > 0) return t('member.detail.getsBack')
  if (selectedMemberBalance.value < 0) return t('member.detail.owes')
  return t('member.detail.settled')
})
const topExpense = computed(() =>
  [...store.expenses].sort((a, b) => convertedExpenseAmount(b) - convertedExpenseAmount(a))[0] ?? null
)
const topPayer = computed(() => {
  const totals = new Map<string, number>()
  for (const expense of store.expenses) {
    totals.set(expense.paidByMemberId, (totals.get(expense.paidByMemberId) ?? 0) + convertedExpenseAmount(expense))
  }
  const [memberId, amount] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0] ?? []
  const member = store.members.find((item) => item.id === memberId)
  return member ? { member, amount } : null
})
const averagePerPerson = computed(() => Math.round(store.totalSpendMinor / Math.max(store.members.length, 1)))
const eventDateLabel = computed(() => {
  if (!store.activeEvent) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(store.activeEvent.createdAt))
})
const hasEverythingSettled = computed(() => store.optimizedSettlements.length === 0 && hasExpenses.value)

async function loadCurrent() {
  if (!eventId.value) return
  isLoadingCurrent.value = true
  loadError.value = false
  try {
    await store.loadEvent(eventId.value)
    if (!store.activeEvent) loadError.value = true
  } finally {
    isLoadingCurrent.value = false
  }
}

onMounted(loadCurrent)
onMounted(() => {
  window.addEventListener('keydown', handleKeyboardShortcut)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

watch(eventId, (next, prev) => {
  if (next && next !== prev) loadCurrent()
})

function handleCreateExpense(payload: CreateExpensePayload) {
  const wasEditing = expenseDialogMode.value === 'edit' && Boolean(editingExpense.value)
  const mutation = wasEditing && editingExpense.value
    ? store.updateExpense(editingExpense.value.id, payload)
    : store.addExpense(payload)

  mutation?.then(() => {
    isExpenseDialogOpen.value = false
    editingExpense.value = null
    expenseDialogMode.value = 'create'
    showToast({ title: wasEditing ? t('toast.expenseUpdated') : t('toast.expenseAdded') })
  })
}

function openAddExpense() {
  editingExpense.value = null
  expenseDialogMode.value = 'create'
  isExpenseDialogOpen.value = true
}

function openEditExpense(expense: Expense) {
  editingExpense.value = expense
  expenseDialogMode.value = 'edit'
  isExpenseDialogOpen.value = true
}

function duplicateExpense(expense: Expense) {
  editingExpense.value = expense
  expenseDialogMode.value = 'duplicate'
  isExpenseDialogOpen.value = true
}

function deleteExpense(expense: Expense) {
  if (!window.confirm(t('expense.delete.confirm'))) return
  store.deleteExpense(expense.id).then(() => {
    showToast({ title: t('toast.expenseDeleted') })
  })
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

function clearCategoryFilter() {
  selectedCategory.value = null
}

function selectMember(memberId: string) {
  selectedMemberId.value = memberId
}

function closeMemberDetails() {
  selectedMemberId.value = null
}

function convertedExpenseAmount(expense: Expense) {
  if (expense.currency === currency.value || !expense.fxRateToDefault) return expense.amountMinor
  return convertMinorCurrency(expense.amountMinor, expense.currency, currency.value, expense.fxRateToDefault)
}

function memberName(member?: GroupMember | null) {
  return member?.displayName ?? t('common.unknown')
}

function handleOnline() {
  isOnline.value = true
}

function handleOffline() {
  isOnline.value = false
}

function handleSettlement(settlement: OptimizedSettlement) {
  store.recordSettlement(settlement).then(() => {
    showToast({ title: t('toast.paymentRecorded') })
  })
}

function handleKeyboardShortcut(event: KeyboardEvent) {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
  if (event.key.toLowerCase() !== 'n' && event.key.toLowerCase() !== 'a') return
  event.preventDefault()
  isExpenseDialogOpen.value = true
}

function back() {
  router.push({ name: 'events' })
}
</script>

<template>
  <div class="event-detail-page">
    <Transition name="surface" mode="out-in">
      <div v-if="loadError" key="event-error" class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p class="text-base font-bold">{{ t('status.eventNotFound.title') }}</p>
        <p class="max-w-xs text-sm text-muted">{{ t('status.eventNotFound.description') }}</p>
        <Button variant="primary" size="sm" @click="back">{{ t('action.allEvents') }}</Button>
      </div>

      <EventDetailSkeleton v-else-if="isLoadingCurrent" key="event-loading" />

      <div v-else key="event-ready" class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div class="grid min-w-0 content-start gap-5">
          <section v-if="store.activeEvent" class="overflow-hidden rounded-2xl border border-border bg-card">
            <div class="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div class="min-w-0">
                <div class="mb-3 flex flex-wrap items-center gap-2">
                  <span class="event-detail-page__date-pill">
                    <CalendarDays class="size-3.5" aria-hidden="true" />
                    {{ eventDateLabel }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black" :class="isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'">
                    <component :is="isOnline ? Wifi : WifiOff" class="size-3.5" aria-hidden="true" />
                    {{ isOnline ? t('sync.online') : t('sync.offline') }}
                  </span>
                  <span v-if="hasEverythingSettled" class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">
                    <Sparkles class="size-3.5" aria-hidden="true" />
                    {{ t('settlement.allDone') }}
                  </span>
                </div>
                <h1 class="truncate text-2xl font-black tracking-tight text-foreground">{{ store.activeEvent.name }}</h1>
                <p class="mt-1 text-sm font-semibold text-muted">{{ t('event.hero.subtitle', { people: store.members.length, expenses: store.expenses.length }) }}</p>
              </div>

              <div class="grid grid-cols-2 gap-2 sm:min-w-72">
                <article class="rounded-xl bg-cardSoft/70 p-3">
                  <p class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted"><ReceiptText class="size-3.5" />{{ t('insight.biggest') }}</p>
                  <p class="mt-1 truncate font-mono text-sm font-black">{{ topExpense ? formatMoney(convertedExpenseAmount(topExpense), currency) : '-' }}</p>
                </article>
                <article class="rounded-xl bg-cardSoft/70 p-3">
                  <p class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted"><Crown class="size-3.5" />{{ t('insight.topPayer') }}</p>
                  <p class="mt-1 truncate text-sm font-black">{{ topPayer ? memberName(topPayer.member) : '-' }}</p>
                </article>
                <article class="rounded-xl bg-cardSoft/70 p-3">
                  <p class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted"><Users class="size-3.5" />{{ t('insight.average') }}</p>
                  <p class="mt-1 truncate font-mono text-sm font-black">{{ formatMoney(averagePerPerson, currency) }}</p>
                </article>
                <article class="rounded-xl bg-cardSoft/70 p-3">
                  <p class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-muted"><Copy class="size-3.5" />{{ t('insight.categories') }}</p>
                  <p class="mt-1 truncate text-sm font-black">{{ selectedCategory ?? t('expense.filter.all') }}</p>
                </article>
              </div>
            </div>
          </section>

          <SummaryBar
            :balances="store.memberBalances"
            :currency="currency"
            :total-spend-minor="store.totalSpendMinor"
            :you-id="youId"
          />

          <section v-if="!hasExpenses" class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <span class="event-detail-page__empty-icon">
              <Plus class="size-6" aria-hidden="true" />
            </span>
            <p class="text-base font-bold">{{ t('expense.empty.title') }}</p>
            <p class="max-w-xs text-sm text-muted">{{ t('expense.empty.description') }}</p>
            <Button variant="primary" size="sm" class="mt-1" @click="openAddExpense">
              <Plus class="size-4" aria-hidden="true" />
              {{ t('expense.add') }}
            </Button>
          </section>

          <ExpenseList
            v-else
            :category-filter="selectedCategory"
            :currency="currency"
            :expenses="store.expenses"
            :members="store.members"
            :you-id="youId"
            @add-expense="openAddExpense"
            @clear-category-filter="clearCategoryFilter"
            @delete-expense="deleteExpense"
            @duplicate-expense="duplicateExpense"
            @edit-expense="openEditExpense"
          />
        </div>

        <aside class="grid min-w-0 content-start gap-4">
          <SettlementPanel
            :currency="currency"
            :members="store.members"
            :settlements="store.optimizedSettlements"
            @settle="handleSettlement"
          />
          <BalancesPanel :balances="store.memberBalances" :currency="currency" :members="store.members" @select-member="selectMember" />
          <CategoryBreakdown :active-category="selectedCategory" :currency="currency" :expenses="store.expenses" @select-category="selectCategory" />
        </aside>
      </div>
    </Transition>

    <Button
      v-if="store.activeEvent && hasExpenses"
      class="event-detail-page__mobile-fab"
      @click="openAddExpense"
    >
      <Plus class="size-4" aria-hidden="true" />
      {{ t('expense.add') }}
    </Button>

    <ExpenseDialog
      v-if="store.activeEvent && store.members.length > 0"
      v-model:open="isExpenseDialogOpen"
      :currency="currency"
      :expense="editingExpense"
      :members="store.members"
      :mode="expenseDialogMode"
      @submit="handleCreateExpense"
    />

    <Dialog v-if="selectedMember" :open="Boolean(selectedMember)" :title="memberName(selectedMember)" :description="t('member.detail.description')" @update:open="closeMemberDetails">
      <div class="grid gap-3 sm:grid-cols-3">
        <article class="rounded-xl border border-border bg-cardSoft p-4">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('member.detail.paid') }}</p>
          <p class="mt-2 font-mono text-xl font-black">{{ formatMoney(selectedMemberPaid, currency) }}</p>
        </article>
        <article class="rounded-xl border border-border bg-cardSoft p-4">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('member.detail.share') }}</p>
          <p class="mt-2 font-mono text-xl font-black">{{ formatMoney(selectedMemberShare, currency) }}</p>
        </article>
        <article class="rounded-xl border border-border bg-cardSoft p-4">
          <p class="text-xs font-black uppercase tracking-wider text-muted">{{ selectedMemberNetLabel }}</p>
          <p class="mt-2 font-mono text-xl font-black" :class="selectedMemberBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'">{{ formatMoney(selectedMemberBalance, currency) }}</p>
        </article>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.event-detail-page {
  @apply min-w-0 pb-32 sm:pb-0;
}

.event-detail-page__date-pill {
  @apply inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-black text-primarySoft;
}

.event-detail-page__empty-icon {
  @apply grid size-12 place-items-center rounded-full bg-primary/15 text-primarySoft;
}

.event-detail-page__mobile-fab {
  @apply fixed right-4 z-30 min-h-12 rounded-full px-5 shadow-2xl shadow-black/40 sm:hidden;
  bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
