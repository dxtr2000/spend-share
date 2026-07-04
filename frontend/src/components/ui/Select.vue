<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from 'reka-ui'

interface SelectOption {
  label: string
  value: string
}

const model = defineModel<string>({ default: '' })

defineProps<{
  ariaLabel: string
  id?: string
  options: SelectOption[]
  placeholder?: string
}>()
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger
      :id="id"
      :aria-label="ariaLabel"
      class="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-cardSoft px-4 text-left text-base font-semibold text-foreground outline-none transition focus-visible:ring-4 focus-visible:ring-primary/30 data-[placeholder]:text-muted"
    >
      <SelectValue :placeholder="placeholder ?? 'Select option'" />
      <SelectIcon>
        <ChevronDown class="size-5 text-muted" aria-hidden="true" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="8"
        class="z-[60] max-h-72 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-2xl shadow-black/40"
      >
        <SelectViewport>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex min-h-11 cursor-pointer select-none items-center rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-foreground outline-none data-[highlighted]:bg-primary/15 data-[highlighted]:text-primary"
          >
            <SelectItemIndicator class="absolute left-3 inline-flex items-center">
              <Check class="size-4" aria-hidden="true" />
            </SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
