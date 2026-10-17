<script setup>
import { ContextMenuRoot } from 'radix-vue'

const props = defineProps({
  modal: { type: Boolean, default: true },
})
</script>

<template>
  <ContextMenuRoot v-bind="props">
    <slot />
  </ContextMenuRoot>
</template>
