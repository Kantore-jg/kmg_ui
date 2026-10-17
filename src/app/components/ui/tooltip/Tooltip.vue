<script setup>
import { TooltipRoot } from 'radix-vue'
import TooltipProvider from './TooltipProvider.vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: undefined },
  delayDuration: { type: Number, default: 0 },
})

const emit = defineEmits(['update:open'])
</script>

<template>
  <TooltipProvider :delay-duration="props.delayDuration">
    <TooltipRoot :open="props.open" :default-open="props.defaultOpen" @update:open="emit('update:open', $event)">
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>
