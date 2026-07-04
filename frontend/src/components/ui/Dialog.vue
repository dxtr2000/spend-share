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
      <DialogOverlay class="dialog-overlay fixed inset-0 z-40 bg-black/70 backdrop-blur-md" />
      <DialogContent
        class="dialog-content fixed inset-x-3 bottom-3 z-50 max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-[1.25rem] border border-border bg-background p-6 shadow-2xl shadow-black/60 outline-none md:left-1/2 md:top-1/2 md:max-w-4xl md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto"
      >
        <header class="mb-5 flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="font-display text-3xl leading-tight text-foreground">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-2 text-sm leading-6 text-muted">
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
