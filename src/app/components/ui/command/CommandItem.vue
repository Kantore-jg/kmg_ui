<script setup>
import { ComboboxItem } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: [String, Object], required: true },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
})

const emit = defineEmits(['select'])
</script>

<template>
  <ComboboxItem
    v-bind="props"
    @select="emit('select', $event)"
    :class="cn(
      'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class
    )"
  >
    <slot />
  </ComboboxItem>
</template>
