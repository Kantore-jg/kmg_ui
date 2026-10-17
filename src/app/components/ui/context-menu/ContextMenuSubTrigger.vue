<script setup>
import { ContextMenuSubTrigger } from 'radix-vue'
import { ChevronRight } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  inset: { type: Boolean, default: false },
  disabled: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <ContextMenuSubTrigger
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class
    )"
    :data-inset="props.inset"
    :disabled="props.disabled"
  >
    <slot />
    <ChevronRight class="ml-auto" />
  </ContextMenuSubTrigger>
</template>
