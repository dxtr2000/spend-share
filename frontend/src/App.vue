<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Pencil, Trash2 } from 'lucide-vue-next'

import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Button from '@/components/ui/Button.vue'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher.vue'
import PinGate from '@/features/auth/PinGate.vue'
import EventCreateModal from '@/features/events/EventCreateModal.vue'
import EventEditModal from '@/features/events/EventEditModal.vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import { useSpendShareStore } from '@/stores/spendShare'
import type { CreateEventPayload, UpdateEventPayload } from '@spend-share/types'

const route = useRoute()
const router = useRouter()
const store = useSpendShareStore()
const { showToast } = useToast()
const { t } = useI18n()
const isUnlocked = shallowRef(false)
const isEventCreateOpen = shallowRef(false)
const isEventEditOpen = shallowRef(false)

const showBack = computed(() => route.name === 'event-detail' || route.name === 'all-events-stats')
const activeEventName = computed(() => {
  if (route.name === 'event-detail') return store.activeEvent?.name
  if (route.name === 'all-events-stats') return t('stats.title')
  return null
})

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

function handleEditEvent() {
  if (!store.activeEvent) return
  isEventEditOpen.value = true
}

function handleUpdateEvent(payload: UpdateEventPayload) {
  if (!store.activeEvent) return
  store.updateEvent(store.activeEvent.id, payload).then(() => {
    isEventEditOpen.value = false
    showToast({ title: t('toast.eventUpdated') })
  })
}

function handleDeleteEvent() {
  if (!store.activeEvent || !window.confirm(t('event.delete.confirm'))) return
  store.deleteEvent(store.activeEvent.id).then(() => {
    router.push({ name: 'events' })
  })
}
</script>

<template>
  <PinGate v-if="!isUnlocked" @unlock="handleUnlock" />

  <main v-else class="min-h-screen w-full overflow-x-clip text-foreground">
    <DashboardHeader
      :show-back="showBack"
      :active-event-name="activeEventName"
      @back="handleBack"
    >
      <template #actions>
        <template v-if="showBack && store.activeEvent">
          <Button variant="ghost" size="icon" class="size-10" :aria-label="t('action.edit')" @click="handleEditEvent">
            <Pencil class="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" class="size-10 text-rose-300 hover:text-rose-200" :aria-label="t('action.delete')" @click="handleDeleteEvent">
            <Trash2 class="size-4" aria-hidden="true" />
          </Button>
        </template>
        <LanguageSwitcher />
      </template>
    </DashboardHeader>

    <div class="app-router-view">
      <RouterView v-slot="{ Component, route }">
        <Transition name="surface" mode="out-in">
          <component :is="Component" :key="route.fullPath" @new-event="handleNewEvent" />
        </Transition>
      </RouterView>
    </div>

    <EventCreateModal v-model:open="isEventCreateOpen" @create-event="handleCreateEvent" />
    <EventEditModal v-model:open="isEventEditOpen" :event="store.activeEvent" @submit="handleUpdateEvent" />
  </main>
</template>

<style scoped>
.app-router-view {
  box-sizing: border-box;
  width: 100%;
  max-width: 78rem;
  min-width: 0;
  margin-inline: auto;
  padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
  padding-bottom: 1rem;
}

@media (min-width: 640px) {
  .app-router-view {
    padding-inline: max(1.5rem, env(safe-area-inset-left)) max(1.5rem, env(safe-area-inset-right));
    padding-bottom: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .app-router-view {
    padding-inline: max(2rem, env(safe-area-inset-left)) max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1280px) {
  .app-router-view {
    padding-inline: max(2.5rem, env(safe-area-inset-left)) max(2.5rem, env(safe-area-inset-right));
  }
}
</style>
