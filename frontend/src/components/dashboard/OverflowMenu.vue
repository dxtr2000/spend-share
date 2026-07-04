<script setup lang="ts">
import { onScopeDispose, shallowRef } from 'vue'
import { MoreVertical, Plus, Trash2 } from 'lucide-vue-next'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle
} from 'reka-ui'

import Button from '@/components/ui/Button.vue'
import { useI18n } from '@/i18n'

const emit = defineEmits<{
  newEvent: []
  reset: []
}>()

const { t } = useI18n()
const menuOpen = shallowRef(false)
const confirmOpen = shallowRef(false)

function toggle(event: Event) {
  event.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function close() {
  menuOpen.value = false
}

function chooseNewEvent() {
  menuOpen.value = false
  emit('newEvent')
}

function chooseReset() {
  menuOpen.value = false
  confirmOpen.value = true
}

function doReset() {
  confirmOpen.value = false
  emit('reset')
}

function onBackdrop() {
  menuOpen.value = false
}

onScopeDispose(() => close())
</script>

<template>
  <div class="relative">
    <Button variant="ghost" size="icon" class="size-10 shrink-0" :aria-label="t('menu.more')" @click="toggle">
      <MoreVertical class="size-5" aria-hidden="true" />
    </Button>

    <template v-if="menuOpen">
      <div class="fixed inset-0 z-40" @click="onBackdrop" />
      <div class="absolute right-0 top-full z-50 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-2xl shadow-black/40">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:bg-primary/15 hover:text-primary"
          @click="chooseNewEvent"
        >
          <Plus class="size-4" aria-hidden="true" />
          {{ t('action.newEvent') }}
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-400 transition hover:bg-rose-500/15"
          @click="chooseReset"
        >
          <Trash2 class="size-4" aria-hidden="true" />
          {{ t('menu.clearAll') }}
        </button>
      </div>
    </template>
  </div>

  <AlertDialogRoot v-model:open="confirmOpen">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm" />
      <AlertDialogContent
        class="fixed left-1/2 top-1/2 z-[66] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 outline-none"
      >
        <AlertDialogTitle class="text-lg font-black">{{ t('menu.confirm.title') }}</AlertDialogTitle>
        <AlertDialogDescription class="mt-2 text-sm leading-6 text-muted">
          {{ t('menu.confirm.description') }}
        </AlertDialogDescription>
        <div class="mt-5 flex justify-end gap-2">
          <AlertDialogCancel as-child>
            <Button variant="ghost">{{ t('action.cancel') }}</Button>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button variant="destructive" @click="doReset">{{ t('action.clearEverything') }}</Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
