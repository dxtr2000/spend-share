<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

defineProps<{
  showBack?: boolean
  activeEventName?: string | null
}>()

defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="sticky top-0 z-30 -mx-4 mb-5 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3.5 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
    <div v-if="showBack" class="flex min-w-0 items-center gap-3">
      <Button variant="ghost" size="sm" class="shrink-0" @click="$emit('back')">
        <ArrowLeft class="size-4" aria-hidden="true" />
        {{ t('action.allEvents') }}
      </Button>
      <span class="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
      <span v-if="activeEventName" class="truncate text-base font-black tracking-tight text-foreground">{{ activeEventName }}</span>
    </div>

    <div v-else class="flex items-center gap-3">
      <span class="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-glow">S</span>
      <div class="leading-tight">
        <p class="text-sm font-black tracking-tight">{{ t('app.name') }}</p>
        <p class="text-xs font-semibold text-muted">{{ t('app.subtitle') }}</p>
      </div>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
