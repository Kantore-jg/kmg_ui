<script setup>
import { RadioGroupRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  defaultValue: { type: String, default: undefined },
  modelValue: { type: String, default: undefined },
  disabled: { type: Boolean, default: undefined },
  name: { type: String, default: undefined },
  required: { type: Boolean, default: undefined },
  orientation: { type: String, default: undefined },
  dir: { type: String, default: undefined },
  loop: { type: Boolean, default: true },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <RadioGroupRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    :class="cn('grid gap-3', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
