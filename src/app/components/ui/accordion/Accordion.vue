<script setup>
import { AccordionRoot } from 'radix-vue'

const props = defineProps({
  type: { type: String, default: 'single' }, // single | multiple
  defaultValue: { type: [String, Array], default: undefined },
  modelValue: { type: [String, Array], default: undefined },
  collapsible: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <AccordionRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <slot />
  </AccordionRoot>
</template>
