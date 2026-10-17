<script setup>
import { TooltipProvider } from 'radix-vue'

const props = defineProps({
  delayDuration: { type: Number, default: 0 },
})
</script>

<template>
  <TooltipProvider v-bind="props">
    <slot />
  </TooltipProvider>
</template>
