<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" aria-label="Loading event">
    <div class="grid gap-5">
      <section class="grid gap-3 sm:grid-cols-3">
        <article v-for="item in 3" :key="item" class="rounded-2xl border border-border bg-card p-4">
          <SkeletonBlock class="h-3 w-24" />
          <SkeletonBlock class="mt-4 h-8 w-32" />
          <SkeletonBlock class="mt-3 h-3 w-28" />
        </article>
      </section>

      <section class="grid gap-3">
        <header class="flex items-center justify-between gap-3">
          <div class="grid gap-2">
            <SkeletonBlock class="h-7 w-28" />
            <SkeletonBlock class="h-4 w-36" />
          </div>
          <SkeletonBlock class="h-10 w-20 rounded-xl" />
        </header>

        <div class="grid gap-2 rounded-2xl border border-border bg-cardSoft p-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <SkeletonBlock class="h-11 rounded-xl" />
          <SkeletonBlock class="h-11 w-64 max-w-full rounded-xl" />
        </div>

        <div class="grid gap-2">
          <article v-for="item in 3" :key="item" class="rounded-xl border border-border bg-card p-4">
            <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <SkeletonBlock class="size-9 rounded-lg" />
              <div class="grid gap-2">
                <SkeletonBlock class="h-5 w-40" />
                <SkeletonBlock class="h-3 w-52 max-w-full" />
                <SkeletonBlock class="h-3 w-36" />
              </div>
              <div class="grid justify-items-end gap-2">
                <SkeletonBlock class="h-6 w-24" />
                <SkeletonBlock class="h-3 w-20" />
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <aside class="grid content-start gap-4">
      <section v-for="panel in 3" :key="panel" class="rounded-2xl border border-border/70 bg-card/60 p-5">
        <SkeletonBlock class="h-4 w-24" />
        <SkeletonBlock class="mt-4 h-10 w-full" />
        <SkeletonBlock class="mt-3 h-10 w-10/12" />
        <SkeletonBlock class="mt-3 h-10 w-8/12" />
      </section>
    </aside>
  </div>
</template>
