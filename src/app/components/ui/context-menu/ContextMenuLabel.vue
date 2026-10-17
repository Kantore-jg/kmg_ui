<script setup>
import { ContextMenuLabel } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  inset: { type: Boolean, default: false },
  class: { type: String, default: '' },
})
</script>

<template>
  <ContextMenuLabel
    :class="cn('text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
    :data-inset="props.inset"
  >
    <slot />
  </ContextMenuLabel>
</template>
