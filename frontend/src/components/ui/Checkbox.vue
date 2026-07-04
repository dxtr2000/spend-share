<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

const model = defineModel<boolean>({ default: false })

withDefaults(
  defineProps<{
    ariaLabel: string
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>

<template>
  <CheckboxRoot
    v-model:checked="model"
    :aria-label="ariaLabel"
    :disabled="disabled"
    class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border bg-white/70 text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
  >
    <CheckboxIndicator>
      <Check class="size-4" aria-hidden="true" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
