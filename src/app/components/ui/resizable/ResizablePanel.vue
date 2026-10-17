<script setup>
import { SplitterPanel } from 'radix-vue'

const props = defineProps({
  defaultSize: { type: Number, default: undefined },
  minSize: { type: Number, default: undefined },
  maxSize: { type: Number, default: undefined },
})
</script>

<template>
  <SplitterPanel v-bind="props">
    <slot />
  </SplitterPanel>
</template>
