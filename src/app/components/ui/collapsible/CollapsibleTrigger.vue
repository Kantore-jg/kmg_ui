<script setup>
import { CollapsibleTrigger } from 'radix-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <CollapsibleTrigger v-bind="props">
    <slot />
  </CollapsibleTrigger>
</template>
