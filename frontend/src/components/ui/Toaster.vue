<script setup lang="ts">
import { ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'

import { useToast } from '@/composables/useToast'

const { dismissToast, toasts } = useToast()
</script>

<template>
  <ToastProvider swipe-direction="right">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      class="grid gap-1 rounded-2xl border border-primary/25 bg-card px-4 py-3 shadow-glow data-[state=closed]:animate-out data-[state=open]:animate-in"
      :duration="3600"
      @update:open="(open) => !open && dismissToast(toast.id)"
    >
      <ToastTitle class="text-sm font-bold text-foreground">{{ toast.title }}</ToastTitle>
      <ToastDescription v-if="toast.description" class="text-sm text-muted">
        {{ toast.description }}
      </ToastDescription>
    </ToastRoot>
    <ToastViewport class="fixed right-4 top-4 z-[70] grid w-[min(24rem,calc(100vw-2rem))] gap-3 outline-none" />
  </ToastProvider>
</template>
