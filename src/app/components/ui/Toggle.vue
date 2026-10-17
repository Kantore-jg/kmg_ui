<script>
import { cva } from 'class-variance-authority'

export const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
</script>

<script setup>
import { Toggle } from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  pressed: { type: Boolean, default: undefined },
  defaultPressed: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: undefined },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:pressed'])
</script>

<template>
  <Toggle
    v-bind="props"
    @update:pressed="emit('update:pressed', $event)"
    :class="cn(toggleVariants({ variant: props.variant, size: props.size, className: props.class }))"
  >
    <slot />
  </Toggle>
</template>

