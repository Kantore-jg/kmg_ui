<script setup>
import { ComboboxRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  modelValue: { type: [String, Array], default: undefined },
  defaultValue: { type: [String, Array], default: undefined },
  open: { type: Boolean, default: true },
  searchTerm: { type: String, default: undefined },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: undefined },
  dir: { type: String, default: undefined },
  filterFunction: { type: Function, default: undefined },
  displayValue: { type: Function, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'update:open', 'update:searchTerm'])
</script>

<template>
  <ComboboxRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    @update:open="emit('update:open', $event)"
    @update:searchTerm="emit('update:searchTerm', $event)"
    :class="cn(
      'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
      props.class
    )"
  >
    <slot />
  </ComboboxRoot>
</template>
