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
  <header class="dashboard-header sticky top-0 z-30 mb-5 flex w-full min-w-0 items-center gap-2 border-b border-border bg-background/85 py-3.5 backdrop-blur-lg sm:gap-3">
    <div v-if="showBack" class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      <Button variant="ghost" size="sm" class="dashboard-back-button shrink-0" :aria-label="t('action.allEvents')" @click="$emit('back')">
        <ArrowLeft class="size-4" aria-hidden="true" />
        <span class="dashboard-back-label">{{ t('action.allEvents') }}</span>
      </Button>
      <span class="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
      <span v-if="activeEventName" class="min-w-0 truncate text-sm font-black tracking-tight text-foreground sm:text-base">{{ activeEventName }}</span>
    </div>

    <div v-else class="flex items-center gap-3">
      <span class="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-glow">S</span>
      <div class="leading-tight">
        <p class="text-sm font-black tracking-tight">{{ t('app.name') }}</p>
        <p class="text-xs font-semibold text-muted">{{ t('app.subtitle') }}</p>
      </div>
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  box-sizing: border-box;
  padding-inline: max(1rem, env(safe-area-inset-left)) max(1rem, env(safe-area-inset-right));
}

@media (max-width: 430px) {
  .dashboard-back-button {
    min-height: 2.5rem;
    width: 2.5rem;
    padding: 0;
  }

  .dashboard-back-label {
    display: none;
  }
}

@media (min-width: 640px) {
  .dashboard-header {
    padding-inline: max(1.5rem, env(safe-area-inset-left)) max(1.5rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1024px) {
  .dashboard-header {
    padding-inline: max(2rem, env(safe-area-inset-left)) max(2rem, env(safe-area-inset-right));
  }
}

@media (min-width: 1280px) {
  .dashboard-header {
    padding-inline: max(2.5rem, env(safe-area-inset-left)) max(2.5rem, env(safe-area-inset-right));
  }
}
</style>
