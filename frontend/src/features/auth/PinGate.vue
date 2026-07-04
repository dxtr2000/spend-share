<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { LockKeyhole } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const emit = defineEmits<{
  unlock: []
}>()

const pin = shallowRef('')
const hasError = shallowRef(false)
const isComplete = computed(() => pin.value.length === 4)

function updatePin(event: Event) {
  const input = event.target as HTMLInputElement
  pin.value = input.value.replace(/\D/g, '').slice(0, 4)
  input.value = pin.value
  hasError.value = false
}

function submitPin() {
  if (pin.value === '2000') {
    emit('unlock')
    return
  }

  hasError.value = true
  pin.value = ''
}
</script>

<template>
  <main class="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-8 text-foreground">
    <form class="w-full rounded-2xl border border-border bg-card p-6 shadow-panel" @submit.prevent="submitPin">
      <div class="mb-6 grid gap-3 text-center">
        <span class="mx-auto grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
          <LockKeyhole class="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 class="text-2xl font-black tracking-tight">{{ t('auth.title') }}</h1>
          <p class="mt-1 text-sm font-semibold text-muted">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <label class="grid gap-2">
        <span class="text-sm font-black">{{ t('auth.pinCode') }}</span>
        <input
          :value="pin"
          autocomplete="one-time-code"
          autofocus
          class="min-h-12 w-full rounded-xl border border-border bg-cardSoft px-4 text-center font-mono text-2xl font-black tracking-[0.45em] text-foreground outline-none transition placeholder:tracking-normal placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/20"
          inputmode="numeric"
          maxlength="4"
          placeholder="0000"
          type="password"
          @input="updatePin"
        />
      </label>

      <p v-if="hasError" class="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
        {{ t('auth.wrongPin') }}
      </p>

      <Button class="mt-5 w-full" :disabled="!isComplete" type="submit">
        {{ t('action.unlock') }}
      </Button>
    </form>
  </main>
</template>
