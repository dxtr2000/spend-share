<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { useI18n, type Locale } from '@/i18n'

const { locale, setLocale } = useI18n()

function choose(nextLocale: Locale) {
  setLocale(nextLocale)
}
</script>

<template>
  <div class="flex rounded-xl border border-border bg-card p-1">
    <Button
      :variant="locale === 'hu' ? 'navActive' : 'ghost'"
      class="min-h-8 px-2.5 text-xs"
      size="sm"
      aria-label="Magyar"
      @click="choose('hu')"
    >
      HU
    </Button>
    <Button
      :variant="locale === 'en' ? 'navActive' : 'ghost'"
      class="min-h-8 px-2.5 text-xs"
      size="sm"
      aria-label="English"
      @click="choose('en')"
    >
      EN
    </Button>
  </div>
</template>
