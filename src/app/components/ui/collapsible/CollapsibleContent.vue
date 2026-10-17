<script setup>
import { CollapsibleContent } from 'radix-vue'

const props = defineProps({
  forceMount: { type: Boolean, default: undefined },
})
</script>

<template>
  <CollapsibleContent v-bind="props">
    <slot />
  </CollapsibleContent>
</template>
