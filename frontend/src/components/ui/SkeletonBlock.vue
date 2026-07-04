<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    class?: string
  }>(),
  {
    class: ''
  }
)

const skeletonClass = computed(() => cn('skeleton-block rounded-xl bg-cardSoft', props.class))
</script>

<template>
  <span :class="skeletonClass" aria-hidden="true" />
</template>
