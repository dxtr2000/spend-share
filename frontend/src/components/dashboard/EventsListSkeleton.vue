<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
</script>

<template>
  <section class="grid gap-4" aria-label="Loading events">
    <header class="flex items-center justify-between gap-3">
      <div class="grid gap-2">
        <SkeletonBlock class="h-8 w-40" />
        <SkeletonBlock class="h-4 w-64 max-w-[70vw]" />
      </div>
      <SkeletonBlock class="h-10 w-28 rounded-xl" />
    </header>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in 3"
        :key="item"
        class="grid gap-3 rounded-2xl border border-border bg-card p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <SkeletonBlock class="size-10 rounded-xl" />
          <SkeletonBlock class="h-7 w-12 rounded-lg" />
        </div>
        <div class="grid gap-2">
          <SkeletonBlock class="h-6 w-36" />
          <SkeletonBlock class="h-4 w-24" />
        </div>
        <div class="flex items-center gap-4 border-t border-border pt-3">
          <SkeletonBlock class="h-4 w-20" />
          <SkeletonBlock class="ml-auto h-4 w-24" />
        </div>
      </article>
    </div>
  </section>
</template>
