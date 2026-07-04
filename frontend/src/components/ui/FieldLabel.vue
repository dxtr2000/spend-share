<script setup lang="ts">
defineProps<{
  htmlFor: string
}>()
</script>

<template>
  <label :for="htmlFor" class="mb-2 block text-sm font-bold text-foreground">
    <slot />
  </label>
</template>
