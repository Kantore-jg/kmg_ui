<script setup>
import { DropdownMenuPortal, DropdownMenuContent } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  forceMount: { type: Boolean, default: undefined },
  sideOffset: { type: Number, default: 4 },
  side: { type: String, default: 'bottom' },
  align: { type: String, default: 'center' },
  alignOffset: { type: Number, default: 0 },
  class: { type: String, default: '' },
})
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="props"
      :class="cn(
        'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.class
      )"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
