<script setup>
import { ToggleGroupRoot } from 'radix-vue'
import { provide } from 'vue'
import { cn } from '@/app/components/ui/utils'
import { toggleVariants } from '../Toggle.vue'

const props = defineProps({
  type: { type: String, default: 'single' }, // single | multiple
  defaultValue: { type: [String, Array], default: undefined },
  modelValue: { type: [String, Array], default: undefined },
  rovingFocus: { type: Boolean, default: true },
  disabled: { type: Boolean, default: undefined },
  dir: { type: String, default: undefined },
  loop: { type: Boolean, default: true },
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

provide('toggleGroup', {
  variant: props.variant,
  size: props.size,
})
</script>

<template>
  <ToggleGroupRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    :class="cn(
      'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
      props.class
    )"
  >
    <slot />
  </ToggleGroupRoot>
</template>
