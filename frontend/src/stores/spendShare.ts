import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'

import { calculateMemberBalances, optimizeSettlements } from '@/lib/settlement'
import { convertMinorCurrency } from '@/lib/money'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import type {
  CreateExpensePayload,
  CreateEventPayload,
  CurrencyCode,
  Expense,
  Event,
  GroupMember,
  OptimizedSettlement,
  RecordedSettlement,
  WorkspaceResponse
} from '@spend-share/types'

function normalizeExpenses(expenses: Expense[], target: CurrencyCode): Expense[] {
  return expenses.map((expense) => {
    if (expense.currency === target) return expense
    const rate = expense.fxRateToDefault ?? 1
    return {
      ...expense,
      amountMinor: convertMinorCurrency(expense.amountMinor, expense.currency, target, rate),
      currency: target,
      participants: expense.participants.map((p) => ({
        ...p,
        shareMinor: convertMinorCurrency(p.shareMinor, expense.currency, target, rate)
      }))
    }
  })
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  if (!response.ok) throw new Error(await response.text())

  return response.json() as Promise<T>
}

export const useSpendShareStore = defineStore('spend-share', () => {
  const { showToast } = useToast()
  const { t } = useI18n()
  const activeEventId = shallowRef<string | null>(null)
  const expenses = ref<Expense[]>([])
  const events = ref<Event[]>([])
  const members = ref<GroupMember[]>([])
  const recordedSettlements = ref<RecordedSettlement[]>([])
  const isLoading = shallowRef(false)

  const activeEvent = computed(() => events.value.find((event) => event.id === activeEventId.value) ?? null)
  const memberIds = computed(() => members.value.map((member) => member.id))
  const normalizedExpenses = computed(() =>
    activeEvent.value ? normalizeExpenses(expenses.value, activeEvent.value.defaultCurrency) : expenses.value
  )
  const memberBalances = computed(() =>
    calculateMemberBalances(memberIds.value, normalizedExpenses.value, recordedSettlements.value)
  )
  const optimizedSettlements = computed(() => optimizeSettlements(memberBalances.value))
  const totalSpendMinor = computed(() => normalizedExpenses.value.reduce((total, expense) => total + expense.amountMinor, 0))
  const hasEvent = computed(() => Boolean(activeEvent.value))

  async function loadList() {
    isLoading.value = true
    try {
      applyWorkspace(await api<WorkspaceResponse>('/api/workspace'))
    } catch (error) {
      showToast({ title: t('toast.loadFailed'), description: error instanceof Error ? error.message : undefined })
    } finally {
      isLoading.value = false
    }
  }

  async function loadEvent(eventId: string) {
    isLoading.value = true
    try {
      applyWorkspace(await api<WorkspaceResponse>(`/api/events/${eventId}`))
    } catch (error) {
      showToast({ title: t('toast.loadEventFailed'), description: error instanceof Error ? error.message : undefined })
    } finally {
      isLoading.value = false
    }
  }

  async function createEvent(payload: CreateEventPayload) {
    return mutate('/api/events', payload)
  }

  async function addExpense(payload: CreateExpensePayload) {
    if (!activeEvent.value) return
    return mutate(`/api/events/${activeEvent.value.id}/expenses`, payload)
  }

  async function recordSettlement(settlement: OptimizedSettlement) {
    if (!activeEvent.value) return
    return mutate(`/api/events/${activeEvent.value.id}/settlements`, settlement)
  }

  async function resetWorkspace() {
    isLoading.value = true
    try {
      applyWorkspace(await api<WorkspaceResponse>('/api/workspace', { method: 'DELETE' }))
    } catch (error) {
      showToast({ title: t('toast.resetFailed'), description: error instanceof Error ? error.message : undefined })
    } finally {
      isLoading.value = false
    }
  }

  async function mutate(url: string, body: unknown) {
    isLoading.value = true
    try {
      applyWorkspace(
        await api<WorkspaceResponse>(url, {
          method: 'POST',
          body: JSON.stringify(body)
        })
      )
    } catch (error) {
      showToast({ title: t('toast.saveFailed'), description: error instanceof Error ? error.message : undefined })
    } finally {
      isLoading.value = false
    }
  }

  function applyWorkspace(workspace: WorkspaceResponse) {
    events.value = workspace.events
    activeEventId.value = workspace.event?.id ?? null
    members.value = workspace.members
    expenses.value = workspace.expenses
    recordedSettlements.value = workspace.settlements
  }

  return {
    activeEvent,
    addExpense,
    createEvent,
    events,
    expenses,
    hasEvent,
    isLoading,
    loadEvent,
    loadList,
    memberBalances,
    members,
    optimizedSettlements,
    recordSettlement,
    resetWorkspace,
    totalSpendMinor
  }
})
