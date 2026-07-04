<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { Primitive } from 'reka-ui'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 disabled:pointer-events-none disabled:opacity-45 disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:bg-white',
        secondary: 'border border-border bg-cardSoft text-muted hover:text-foreground',
        ghost: 'border border-border bg-card text-muted hover:bg-cardSoft hover:text-foreground',
        nav: 'text-muted hover:bg-cardSoft hover:text-foreground',
        navActive: 'bg-card text-foreground shadow-none',
        destructive: 'bg-destructive text-white hover:bg-red-700'
      },
      size: {
        default: 'px-4 py-2.5',
        sm: 'px-3 py-2 text-xs',
        icon: 'p-0'
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
