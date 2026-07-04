<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { ReceiptText } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import Dialog from '@/components/ui/Dialog.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { useI18n } from '@/i18n'
import { formatMoney, parseMoneyToMinor, splitEvenly } from '@/lib/money'
import { categoryList, currencyOptions } from '@/features/expenses/categories'
import type { CreateExpensePayload, CurrencyCode, ExpenseParticipant, GroupMember } from '@spend-share/types'

const props = defineProps<{
  currency: CurrencyCode
  members: GroupMember[]
}>()

const emit = defineEmits<{
  submit: [payload: CreateExpensePayload]
}>()

const open = defineModel<boolean>('open', { default: false })
const title = shallowRef('')
const amount = shallowRef('')
const expenseCurrency = shallowRef<CurrencyCode>(props.currency)
const paidByMemberId = shallowRef('')
const date = shallowRef(new Date().toISOString().slice(0, 10))
const notes = shallowRef('')
const category = shallowRef('Food & drink')
const splitMode = shallowRef<'equal' | 'custom'>('equal')
const selectedMembers = reactive<Record<string, boolean>>({})
const customShares = reactive<Record<string, string>>({})
const submitAttempted = shallowRef(false)
const { t } = useI18n()

const memberOptions = computed(() => props.members.map((member) => ({ label: member.displayName, value: member.id })))
const selectedMemberIds = computed(() => props.members.filter((member) => selectedMembers[member.id]).map((member) => member.id))
const amountMinor = computed(() => parseMoneyToMinor(amount.value, expenseCurrency.value))
const equalShares = computed(() => splitEvenly(Number.isFinite(amountMinor.value) ? amountMinor.value : 0, selectedMemberIds.value))
const customParticipants = computed<ExpenseParticipant[]>(() =>
  selectedMemberIds.value.map((memberId) => ({
    memberId,
    shareMinor: parseMoneyToMinor(customShares[memberId] ?? '0', expenseCurrency.value)
  }))
)
const participants = computed(() => (splitMode.value === 'equal' ? equalShares.value : customParticipants.value))
const participantsTotal = computed(() =>
  participants.value.reduce((total, participant) => total + (Number.isFinite(participant.shareMinor) ? participant.shareMinor : 0), 0)
)
const splitSummary = computed(() => {
  const count = selectedMemberIds.value.length
  if (count === 0) return t('expense.selectPeople')
  return t('expense.shareSummary', {
    amount: formatMoney(count ? Math.round(participantsTotal.value / count) : 0, expenseCurrency.value),
    count
  })
})
const selectedTotalLabel = computed(() => formatMoney(participantsTotal.value, expenseCurrency.value))
const validationError = computed(() => {
  if (!Number.isFinite(amountMinor.value) || amountMinor.value <= 0) return t('expense.validation.amount')
  if (!paidByMemberId.value) return t('expense.validation.payer')
  if (selectedMemberIds.value.length === 0) return t('expense.validation.people')
  if (participants.value.some((participant) => !Number.isFinite(participant.shareMinor) || participant.shareMinor < 0)) {
    return t('expense.validation.customShares')
  }
  if (participantsTotal.value !== amountMinor.value) {
    return t('expense.sharesMustEqual', { amount: formatMoney(amountMinor.value, expenseCurrency.value) })
  }
  return ''
})
const canSubmit = computed(() => validationError.value === '')

watch(open, (isOpen) => { if (isOpen) resetForm() }, { immediate: true })
watch(() => props.members, () => ensureMemberDefaults(), { immediate: true })

function ensureMemberDefaults() {
  for (const member of props.members) {
    selectedMembers[member.id] = selectedMembers[member.id] ?? true
    customShares[member.id] = customShares[member.id] ?? ''
  }
  if (!paidByMemberId.value && props.members[0]) paidByMemberId.value = props.members[0].id
}

function resetForm() {
  title.value = ''
  amount.value = ''
  expenseCurrency.value = props.currency
  paidByMemberId.value = props.members[0]?.id ?? ''
  date.value = new Date().toISOString().slice(0, 10)
  notes.value = ''
  category.value = 'Food & drink'
  splitMode.value = 'equal'
  submitAttempted.value = false
  for (const member of props.members) {
    selectedMembers[member.id] = true
    customShares[member.id] = ''
  }
}

function submitForm() {
  submitAttempted.value = true
  if (!canSubmit.value) return
  emit('submit', {
    title: title.value.trim() || category.value,
    amountMinor: amountMinor.value,
    currency: expenseCurrency.value,
    paidByMemberId: paidByMemberId.value,
    category: category.value,
    date: date.value,
    notes: notes.value.trim() || undefined,
    participants: participants.value
  })
}

</script>

<template>
  <Dialog v-model:open="open" :title="t('expense.add')" :description="t('expense.dialog.description')">
    <form class="grid gap-4" @submit.prevent="submitForm" @keydown.meta.enter.prevent="submitForm" @keydown.ctrl.enter.prevent="submitForm">
      <div>
        <FieldLabel html-for="expense-title">{{ t('expense.titleField') }}</FieldLabel>
        <Input id="expense-title" v-model="title" autofocus :placeholder="t('expense.titlePlaceholder')" />
      </div>

      <div>
        <FieldLabel html-for="expense-amount">{{ t('expense.amount') }}</FieldLabel>
        <Input
          id="expense-amount"
          v-model="amount"
          inputmode="decimal"
          placeholder="0.00"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel html-for="expense-currency">{{ t('expense.currency') }}</FieldLabel>
          <Select id="expense-currency" v-model="expenseCurrency" :ariaLabel="t('expense.currency')" :options="currencyOptions" />
        </div>
        <div>
          <FieldLabel html-for="expense-date">{{ t('expense.date') }}</FieldLabel>
          <DatePicker id="expense-date" v-model="date" :aria-label="t('expense.date')" />
        </div>
      </div>

      <div>
        <FieldLabel html-for="expense-category">{{ t('expense.category') }}</FieldLabel>
        <div id="expense-category" class="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-cardSoft p-2">
          <Button
            v-for="item in categoryList"
            :key="item.label"
            :variant="category === item.label ? 'navActive' : 'ghost'"
            class="rounded-lg px-2.5 text-muted hover:text-foreground data-[active=true]:text-foreground"
            :data-active="category === item.label"
            size="sm"
            @click="category = item.label"
          >
            <component :is="item.icon" class="size-4" aria-hidden="true" />
            {{ item.label }}
          </Button>
        </div>
      </div>

      <div>
        <FieldLabel html-for="expense-payer">{{ t('expense.payer') }}</FieldLabel>
        <Select
          id="expense-payer"
          v-model="paidByMemberId"
          :ariaLabel="t('expense.payerPlaceholder')"
          :options="memberOptions"
          :placeholder="t('expense.payerPlaceholder')"
        />
      </div>

      <section class="rounded-xl border border-border bg-cardSoft p-4">
        <header class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-muted">{{ t('expense.shareBetween') }}</p>
            <p class="mt-0.5 text-sm font-bold text-muted/80">{{ splitSummary }}</p>
          </div>
          <div class="flex gap-1 rounded-xl bg-card p-1">
            <Button :variant="splitMode === 'equal' ? 'navActive' : 'ghost'" size="sm" @click="splitMode = 'equal'">{{ t('expense.share.equal') }}</Button>
            <Button :variant="splitMode === 'custom' ? 'navActive' : 'ghost'" size="sm" @click="splitMode = 'custom'">{{ t('expense.share.custom') }}</Button>
          </div>
        </header>

        <div class="grid gap-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="grid min-h-12 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card px-3"
          >
            <Checkbox v-model="selectedMembers[member.id]" :ariaLabel="`Toggle ${member.displayName}`" />
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-black text-background"
              :style="{ backgroundColor: member.color }"
            >{{ member.displayName.slice(0, 1) }}</span>
            <strong class="truncate text-sm font-black">{{ member.displayName }}</strong>
            <em v-if="splitMode === 'equal'" class="font-mono text-sm not-italic text-muted" style="font-variant-numeric: tabular-nums">
              {{ formatMoney(equalShares.find((share) => share.memberId === member.id)?.shareMinor ?? 0, expenseCurrency) }}
            </em>
            <Input
              v-else-if="selectedMembers[member.id]"
              :id="`share-${member.id}`"
              v-model="customShares[member.id]"
              class="h-10 min-h-10 w-28 text-right"
              inputmode="decimal"
              placeholder="0.00"
            />
          </div>
        </div>
      </section>

      <div>
        <FieldLabel html-for="expense-notes">{{ t('expense.notes') }}</FieldLabel>
        <Input id="expense-notes" v-model="notes" :placeholder="t('expense.notesPlaceholder')" />
      </div>

      <p v-if="submitAttempted && validationError" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
        {{ validationError }}
      </p>

      <footer class="-mx-6 -mb-6 mt-2 flex items-center justify-end gap-2 border-t border-border px-6 py-4">
        <div class="mr-auto inline-flex items-center gap-2 font-mono text-sm font-bold text-muted">
          <ReceiptText class="size-4" aria-hidden="true" />
          {{ selectedTotalLabel }}
        </div>
        <Button variant="ghost" @click="open = false">{{ t('action.cancel') }}</Button>
        <Button :disabled="submitAttempted && !canSubmit" type="submit">{{ t('expense.add') }}</Button>
      </footer>
    </form>
  </Dialog>
</template>
