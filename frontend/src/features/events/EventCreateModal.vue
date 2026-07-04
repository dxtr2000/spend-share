<script setup lang="ts">
import Dialog from '@/components/ui/Dialog.vue'
import EventSetup from '@/features/events/EventSetup.vue'
import { useI18n } from '@/i18n'
import type { CreateEventPayload } from '@spend-share/types'

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()

const emit = defineEmits<{
  createEvent: [payload: CreateEventPayload]
}>()

function createEvent(payload: CreateEventPayload) {
  emit('createEvent', payload)
}
</script>

<template>
  <Dialog v-model:open="open" :title="t('event.create.title')" :description="t('event.create.description')">
    <EventSetup embedded @create-event="createEvent" @cancel="open = false" />
  </Dialog>
</template>
