<script setup>
import { SelectRoot } from 'radix-vue'

const props = defineProps({
  defaultValue: { type: String, default: undefined },
  modelValue: { type: String, default: undefined },
  defaultOpen: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
  dir: { type: String, default: undefined },
  name: { type: String, default: undefined },
  autocomplete: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
})

const emits = defineEmits(['update:modelValue', 'update:open'])
</script>

<template>
  <SelectRoot v-bind="props" @update:modelValue="emits('update:modelValue', $event)" @update:open="emits('update:open', $event)">
    <slot />
  </SelectRoot>
</template>
