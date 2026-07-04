<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import PinGate from '@/features/auth/PinGate.vue'
import EventCreateModal from '@/features/events/EventCreateModal.vue'
import { useSpendShareStore } from '@/stores/spendShare'
import type { CreateEventPayload } from '@spend-share/types'

const route = useRoute()
const router = useRouter()
const store = useSpendShareStore()
const isUnlocked = shallowRef(false)
const isEventCreateOpen = shallowRef(false)

const showBack = computed(() => route.name === 'event-detail')
const activeEventName = computed(() => (route.name === 'event-detail' ? store.activeEvent?.name : null))

onMounted(() => {
  isUnlocked.value = sessionStorage.getItem('spend-share-unlocked') === 'true'
})

function handleUnlock() {
  sessionStorage.setItem('spend-share-unlocked', 'true')
  isUnlocked.value = true
}

function handleBack() {
  router.push({ name: 'events' })
}

function handleNewEvent() {
  isEventCreateOpen.value = true
}

function handleCreateEvent(payload: CreateEventPayload) {
  store.createEvent(payload).then(() => {
    isEventCreateOpen.value = false
    if (store.activeEvent) {
      router.push({ name: 'event-detail', params: { eventId: store.activeEvent.id } })
    }
  })
}
</script>

<template>
  <PinGate v-if="!isUnlocked" @unlock="handleUnlock" />

  <main v-else class="min-h-screen w-full px-4 py-4 text-foreground sm:px-6 sm:py-6 lg:px-8 xl:px-10">
    <DashboardHeader
      :show-back="showBack"
      :active-event-name="activeEventName"
      @back="handleBack"
    >
      <template #actions>
        <LanguageSwitcher />
      </template>
    </DashboardHeader>

    <RouterView v-slot="{ Component, route }">
      <Transition name="surface" mode="out-in">
        <component :is="Component" :key="route.fullPath" @new-event="handleNewEvent" />
      </Transition>
    </RouterView>

    <EventCreateModal v-model:open="isEventCreateOpen" @create-event="handleCreateEvent" />
  </main>
</template>
