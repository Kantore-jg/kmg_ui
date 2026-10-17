<script setup>
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'radix-vue'
import { cn } from './utils'
import { computed } from 'vue'

const props = defineProps({
  defaultValue: { type: Array, default: undefined },
  modelValue: { type: Array, default: () => [0] },
  disabled: { type: Boolean, default: false },
  orientation: { type: String, default: 'horizontal' },
  step: { type: Number, default: 1 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  minStepsBetweenThumbs: { type: Number, default: 0 },
  dir: { type: String, default: undefined },
  inverted: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'valueCommit'])

const values = computed(() => props.modelValue || props.defaultValue || [props.min])
</script>

<template>
  <SliderRoot
    :class="cn(
      'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      props.class
    )"
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    @valueCommit="emit('valueCommit', $event)"
  >
    <SliderTrack
      class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
    >
      <SliderRange class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
    </SliderTrack>
    <SliderThumb
      v-for="(val, index) in values"
      :key="index"
      class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
