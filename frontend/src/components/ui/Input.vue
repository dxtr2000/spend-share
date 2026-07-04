<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/lib/utils'

const model = defineModel<string>({ default: '' })
const props = withDefaults(
  defineProps<{
    ariaDescribedby?: string
    autofocus?: boolean
    class?: string
    inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
    id: string
    max?: string
    min?: string
    placeholder?: string
    step?: string
    type?: 'text' | 'number' | 'date' | 'email'
  }>(),
  {
    ariaDescribedby: undefined,
    autofocus: false,
    class: '',
    inputmode: 'text',
    max: undefined,
    min: undefined,
    placeholder: '',
    step: undefined,
    type: 'text'
  }
)

const inputClass = computed(() =>
  cn(
    'min-h-11 w-full rounded-xl border border-border bg-cardSoft px-4 text-base font-semibold text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/20',
    props.class
  )
)
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :aria-describedby="ariaDescribedby"
    :autofocus="autofocus"
    :class="inputClass"
    :inputmode="inputmode"
    :max="max"
    :min="min"
    :placeholder="placeholder"
    :step="step"
    :type="type"
  />
</template>
