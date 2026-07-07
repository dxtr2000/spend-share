<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { currencyOptions } from '@/features/expenses/categories'
import { useI18n } from '@/i18n'
import type { CurrencyCode, Event, UpdateEventPayload } from '@spend-share/types'

const props = defineProps<{
  event?: Event | null
}>()

const emit = defineEmits<{
  submit: [payload: UpdateEventPayload]
}>()

const open = defineModel<boolean>('open', { default: false })
const name = shallowRef('')
const currency = shallowRef<CurrencyCode>('USD')
const submitted = shallowRef(false)
const { t } = useI18n()

const validationError = computed(() => (name.value.trim() ? '' : t('event.validation.name')))

watch(open, (isOpen) => {
  if (!isOpen) return
  name.value = props.event?.name ?? ''
  currency.value = props.event?.defaultCurrency ?? 'USD'
  submitted.value = false
})

function submitForm() {
  submitted.value = true
  if (validationError.value) return
  emit('submit', { name: name.value.trim(), currency: currency.value })
}
</script>

<template>
  <Dialog v-model:open="open" :title="t('event.edit')" :description="t('event.edit.description')">
    <form class="grid gap-4" @submit.prevent="submitForm">
      <div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <FieldLabel html-for="edit-event-name">{{ t('event.name') }}</FieldLabel>
          <Input id="edit-event-name" v-model="name" autocomplete="off" autofocus name="edit-event-name" :placeholder="t('event.namePlaceholder')" />
        </div>
        <div>
          <FieldLabel html-for="edit-event-currency">{{ t('event.currency') }}</FieldLabel>
          <Select id="edit-event-currency" v-model="currency" :ariaLabel="t('event.currency')" :options="currencyOptions" />
        </div>
      </div>

      <p v-if="submitted && validationError" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
        {{ validationError }}
      </p>

      <footer class="-mx-6 -mb-6 mt-2 flex justify-end gap-2 border-t border-border px-6 py-4">
        <Button variant="ghost" @click="open = false">{{ t('action.cancel') }}</Button>
        <Button type="submit">{{ t('action.save') }}</Button>
      </footer>
    </form>
  </Dialog>
</template>
