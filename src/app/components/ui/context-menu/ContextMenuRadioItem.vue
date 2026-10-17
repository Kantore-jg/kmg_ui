<script setup>
import { ContextMenuRadioItem, ContextMenuItemIndicator } from 'radix-vue'
import { Circle } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <ContextMenuRadioItem
    v-bind="props"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class
    )"
  >
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <ContextMenuItemIndicator>
        <Circle class="size-2 fill-current" />
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuRadioItem>
</template>
