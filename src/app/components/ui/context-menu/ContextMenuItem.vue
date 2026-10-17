<script setup>
import { ContextMenuItem } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  inset: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
})
</script>

<template>
  <ContextMenuItem
    v-bind="props"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.inset && 'pl-8',
      props.class
    )"
  >
    <slot />
  </ContextMenuItem>
</template>
