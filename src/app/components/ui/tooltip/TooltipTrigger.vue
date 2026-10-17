<script setup>
import { TooltipTrigger } from 'radix-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <TooltipTrigger v-bind="props">
    <slot />
  </TooltipTrigger>
</template>
