<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { Primitive } from 'reka-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'app-button',
  {
    variants: {
      variant: {
        primary: 'app-button--primary',
        secondary: 'app-button--secondary',
        ghost: 'app-button--ghost',
        nav: 'app-button--nav',
        navActive: 'app-button--nav-active',
        destructive: 'app-button--destructive'
      },
      size: {
        default: 'app-button--default',
        sm: 'app-button--sm',
        icon: 'app-button--icon'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(
  defineProps<{
    class?: string
    disabled?: boolean
    size?: ButtonVariants['size']
    type?: 'button' | 'submit' | 'reset'
    variant?: ButtonVariants['variant']
  }>(),
  {
    class: '',
    disabled: false,
    size: 'default',
    type: 'button',
    variant: 'primary'
  }
)

const buttonClass = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class))
</script>

<template>
  <Primitive as="button" :class="buttonClass" :disabled="disabled" :type="type">
    <slot />
  </Primitive>
</template>

<style scoped>
.app-button {
  @apply inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-45 disabled:active:scale-100;
}

.app-button--primary {
  @apply bg-foreground text-background hover:bg-white;
}

.app-button--secondary {
  @apply border border-border bg-cardSoft text-zinc-200 hover:border-muted/80 hover:text-foreground;
}

.app-button--ghost {
  @apply border border-border bg-card text-zinc-200 hover:bg-cardSoft hover:text-foreground;
}

.app-button--nav {
  @apply text-zinc-300 hover:bg-cardSoft hover:text-foreground;
}

.app-button--nav-active {
  @apply bg-card text-foreground shadow-none;
}

.app-button--destructive {
  @apply bg-destructive text-white hover:bg-red-700;
}

.app-button--default {
  @apply px-4 py-2.5;
}

.app-button--sm {
  @apply px-3 py-2 text-xs;
}

.app-button--icon {
  @apply p-0;
}
</style>
