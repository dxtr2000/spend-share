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
    class="app-checkbox"
  >
    <CheckboxIndicator>
      <Check class="size-4" aria-hidden="true" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

<style scoped>
.app-checkbox {
  @apply flex size-6 shrink-0 items-center justify-center rounded-lg border border-border bg-white/80 text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary;
}
</style>
