<script setup>
import { ProgressRoot, ProgressIndicator } from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  modelValue: { type: [Number, null], default: undefined },
  max: { type: Number, default: 100 },
  getValueLabel: { type: Function, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <ProgressRoot
    v-bind="props"
    :class="cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', props.class)"
    style="transform: translateZ(0)"
  >
    <ProgressIndicator
      class="bg-primary h-full w-full flex-1 transition-all"
      :style="`transform: translateX(-${100 - (props.modelValue || 0)}%)`"
    />
  </ProgressRoot>
</template>
