<script setup>
import { HoverCardTrigger } from 'radix-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <HoverCardTrigger v-bind="props">
    <slot />
  </HoverCardTrigger>
</template>
