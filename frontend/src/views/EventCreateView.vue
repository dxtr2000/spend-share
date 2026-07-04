<script setup lang="ts">
import { useRouter } from 'vue-router'

import EventSetup from '@/features/events/EventSetup.vue'
import { useSpendShareStore } from '@/stores/spendShare'
import type { CreateEventPayload } from '@spend-share/types'

const store = useSpendShareStore()
const router = useRouter()

function createEvent(payload: CreateEventPayload) {
  store.createEvent(payload).then(() => {
    if (store.activeEvent) {
      router.push({ name: 'event-detail', params: { eventId: store.activeEvent.id } })
    } else {
      router.push({ name: 'events' })
    }
  })
}

function cancel() {
  router.push({ name: 'events' })
}
</script>

<template>
  <EventSetup @create-event="createEvent" @cancel="cancel" />
</template>