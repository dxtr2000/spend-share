<script setup lang="ts">
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui'

import Button from './Button.vue'

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  description?: string
  title: string
}>()
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="app-dialog-overlay dialog-overlay" />
      <DialogContent
        class="app-dialog-content dialog-content"
      >
        <header class="app-dialog-header">
          <div>
            <DialogTitle class="app-dialog-title">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="app-dialog-description">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <Button variant="ghost" size="icon" class="size-11 shrink-0" aria-label="Close dialog">
              <X class="size-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </header>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.app-dialog-overlay {
  @apply fixed inset-0 z-40 bg-black/70 backdrop-blur-md;
}

.app-dialog-content {
  @apply fixed left-1/2 top-1/2 z-50 max-h-[calc(100svh-1.5rem)] w-[min(calc(100vw-1.5rem),56rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-[1.25rem] border border-border bg-background p-6 shadow-2xl shadow-black/60 outline-none focus-visible:ring-4 focus-visible:ring-primary/30;
}

.app-dialog-header {
  @apply mb-5 flex items-start justify-between gap-4;
}

.app-dialog-title {
  @apply font-display text-3xl leading-tight text-foreground;
}

.app-dialog-description {
  @apply mt-2 text-sm leading-6 text-zinc-300;
}
</style>
