<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/ui/Button.vue'
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
import type { CreateExpensePayload, CurrencyCode, OptimizedSettlement } from '@spend-share/types'

const route = useRoute()
const router = useRouter()
const store = useSpendShareStore()
const { showToast } = useToast()
const { t } = useI18n()

const isExpenseDialogOpen = shallowRef(false)
const isLoadingCurrent = shallowRef(true)
const loadError = shallowRef(false)

const eventId = computed(() => route.params.eventId as string | undefined)
const currency = computed<CurrencyCode>(() => store.activeEvent?.defaultCurrency ?? 'USD')
const youId = computed(() => store.members[0]?.id ?? null)
const hasExpenses = computed(() => store.expenses.length > 0)

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
onMounted(() => window.addEventListener('keydown', handleKeyboardShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleKeyboardShortcut))

watch(eventId, (next, prev) => {
  if (next && next !== prev) loadCurrent()
})

function handleCreateExpense(payload: CreateExpensePayload) {
  store.addExpense(payload).then(() => {
    isExpenseDialogOpen.value = false
    showToast({ title: t('toast.expenseAdded') })
  })
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
  <div>
    <Transition name="surface" mode="out-in">
      <div v-if="loadError" key="event-error" class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
        <p class="text-base font-bold">{{ t('status.eventNotFound.title') }}</p>
        <p class="max-w-xs text-sm text-muted">{{ t('status.eventNotFound.description') }}</p>
        <Button variant="primary" size="sm" @click="back">{{ t('action.allEvents') }}</Button>
      </div>

      <EventDetailSkeleton v-else-if="isLoadingCurrent" key="event-loading" />

      <div v-else key="event-ready" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div class="grid content-start gap-5">
          <SummaryBar
            :balances="store.memberBalances"
            :currency="currency"
            :total-spend-minor="store.totalSpendMinor"
            :you-id="youId"
          />

          <section v-if="!hasExpenses" class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <span class="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
              <Plus class="size-6" aria-hidden="true" />
            </span>
            <p class="text-base font-bold">{{ t('expense.empty.title') }}</p>
            <p class="max-w-xs text-sm text-muted">{{ t('expense.empty.description') }}</p>
            <Button variant="primary" size="sm" class="mt-1" @click="isExpenseDialogOpen = true">
              <Plus class="size-4" aria-hidden="true" />
              {{ t('expense.add') }}
            </Button>
          </section>

          <ExpenseList
            v-else
            :currency="currency"
            :expenses="store.expenses"
            :members="store.members"
            :you-id="youId"
            @add-expense="isExpenseDialogOpen = true"
          />
        </div>

        <aside class="grid content-start gap-4">
          <SettlementPanel
            :currency="currency"
            :members="store.members"
            :settlements="store.optimizedSettlements"
            @settle="handleSettlement"
          />
          <BalancesPanel :balances="store.memberBalances" :currency="currency" :members="store.members" />
          <CategoryBreakdown :currency="currency" :expenses="store.expenses" />
        </aside>
      </div>
    </Transition>

    <ExpenseDialog
      v-if="store.activeEvent && store.members.length > 0"
      v-model:open="isExpenseDialogOpen"
      :currency="currency"
      :members="store.members"
      @submit="handleCreateExpense"
    />
  </div>
</template>
