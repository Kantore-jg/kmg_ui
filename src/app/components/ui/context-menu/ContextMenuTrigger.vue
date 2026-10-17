<script setup>
import { ContextMenuTrigger } from 'radix-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <ContextMenuTrigger v-bind="props">
    <slot />
  </ContextMenuTrigger>
</template>
