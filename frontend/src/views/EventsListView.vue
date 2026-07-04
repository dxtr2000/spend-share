<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'

import EventsList from '@/components/dashboard/EventsList.vue'
import EventsListSkeleton from '@/components/dashboard/EventsListSkeleton.vue'
import { useToast } from '@/composables/useToast'
import EventEditModal from '@/features/events/EventEditModal.vue'
import { useI18n } from '@/i18n'
import { useSpendShareStore } from '@/stores/spendShare'
import type { EventSummary, UpdateEventPayload } from '@spend-share/types'

const store = useSpendShareStore()
const router = useRouter()
const { showToast } = useToast()
const { t } = useI18n()

const emit = defineEmits<{
  newEvent: []
}>()

const eventSummaries = ref<EventSummary[]>([])
const isLoading = shallowRef(true)
const editingEvent = shallowRef<EventSummary | null>(null)
const isEditOpen = shallowRef(false)

async function refreshSummaries() {
  const response = await fetch('/api/events')
  if (!response.ok) throw new Error(await response.text())
  const data = (await response.json()) as { events: EventSummary[] }
  eventSummaries.value = data.events
}

async function loadEvents() {
  isLoading.value = true
  try {
    await store.loadList()
    await refreshSummaries()
  } catch (error) {
    eventSummaries.value = []
    showToast({ title: t('toast.loadEventsFailed'), description: error instanceof Error ? error.message : undefined })
  } finally {
    isLoading.value = false
  }
}

onMounted(loadEvents)

onBeforeRouteUpdate((_to, _from, next) => {
  loadEvents().finally(next)
})

function openEvent(eventId: string) {
  router.push({ name: 'event-detail', params: { eventId } })
}

function newEvent() {
  emit('newEvent')
}

function viewStats() {
  router.push({ name: 'all-events-stats' })
}

function editEvent(eventId: string) {
  editingEvent.value = eventSummaries.value.find((event) => event.id === eventId) ?? null
  if (editingEvent.value) isEditOpen.value = true
}

function updateEvent(payload: UpdateEventPayload) {
  if (!editingEvent.value) return
  store.updateEvent(editingEvent.value.id, payload).then(async () => {
    isEditOpen.value = false
    editingEvent.value = null
    await refreshSummaries()
    showToast({ title: t('toast.eventUpdated') })
  })
}

function deleteEvent(eventId: string) {
  if (!window.confirm(t('event.delete.confirm'))) return
  store.deleteEvent(eventId).then(async () => {
    await refreshSummaries()
    showToast({ title: t('toast.eventDeleted') })
  })
}
</script>

<template>
  <div>
    <Transition name="surface" mode="out-in">
      <EventsListSkeleton v-if="isLoading" key="events-loading" />
      <EventsList
        v-else
        key="events-ready"
        :events="eventSummaries"
        @delete-event="deleteEvent"
        @edit-event="editEvent"
        @open-event="openEvent"
        @new-event="newEvent"
        @view-stats="viewStats"
      />
    </Transition>

    <EventEditModal v-model:open="isEditOpen" :event="editingEvent" @submit="updateEvent" />
  </div>
</template>
