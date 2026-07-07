<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { CalendarDays } from 'lucide-vue-next'

import AllEventsStats from '@/components/dashboard/AllEventsStats.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import type { AllEventsStatsResponse } from '@spend-share/types'

const { showToast } = useToast()
const { t } = useI18n()

const stats = shallowRef<AllEventsStatsResponse | null>(null)
const isLoading = shallowRef(true)

async function loadStats() {
  isLoading.value = true
  try {
    const response = await fetch('/api/stats')
    if (!response.ok) throw new Error(await response.text())
    stats.value = (await response.json()) as AllEventsStatsResponse
  } catch (error) {
    stats.value = null
    showToast({ title: t('toast.loadStatsFailed'), description: error instanceof Error ? error.message : undefined })
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStats)
</script>

<template>
  <section class="grid gap-5">
    <header>
      <div>
        <h1 class="text-2xl font-black tracking-tight">{{ t('stats.title') }}</h1>
        <p class="text-sm font-semibold text-muted">{{ t('stats.subtitle') }}</p>
      </div>
    </header>

    <div v-if="isLoading" class="grid gap-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonBlock v-for="index in 4" :key="index" class="h-28 rounded-2xl" />
      </div>
      <SkeletonBlock class="h-72 rounded-2xl" />
      <SkeletonBlock class="h-56 rounded-2xl" />
    </div>

    <div
      v-else-if="!stats || stats.totals.eventCount === 0"
      class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center"
    >
      <span class="all-events-stats-view__empty-icon">
        <CalendarDays class="size-6" aria-hidden="true" />
      </span>
      <p class="text-base font-bold">{{ t('stats.empty.title') }}</p>
      <p class="max-w-xs text-sm text-muted">{{ t('stats.empty.description') }}</p>
    </div>

    <AllEventsStats v-else :stats="stats" />
  </section>
</template>

<style scoped>
.all-events-stats-view__empty-icon {
  @apply grid size-12 place-items-center rounded-full bg-primary/15 text-primarySoft;
}
</style>
