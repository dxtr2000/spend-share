<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/lib/utils'

const model = defineModel<string>({ default: '' })
const props = withDefaults(
  defineProps<{
    ariaDescribedby?: string
    ariaInvalid?: boolean
    autocomplete?: string
    autofocus?: boolean
    class?: string
    inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
    id: string
    max?: string
    min?: string
    name?: string
    placeholder?: string
    step?: string
    type?: 'text' | 'number' | 'date' | 'email'
  }>(),
  {
    ariaDescribedby: undefined,
    ariaInvalid: false,
    autocomplete: 'off',
    autofocus: false,
    class: '',
    inputmode: 'text',
    max: undefined,
    min: undefined,
    name: undefined,
    placeholder: '',
    step: undefined,
    type: 'text'
  }
)

const inputClass = computed(() =>
  cn(
    'app-input',
    props.class
  )
)
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :aria-describedby="ariaDescribedby"
    :aria-invalid="ariaInvalid || undefined"
    :autocomplete="autocomplete"
    :autofocus="autofocus"
    :class="inputClass"
    :inputmode="inputmode"
    :max="max"
    :min="min"
    :name="name ?? id"
    :placeholder="placeholder"
    :step="step"
    :type="type"
  />
</template>

<style scoped>
.app-input {
  @apply min-h-11 w-full rounded-xl border border-border bg-cardSoft px-4 text-base font-semibold text-foreground outline-none transition placeholder:text-zinc-400 focus:border-primarySoft focus:ring-4 focus:ring-primary/25;
}
</style>
