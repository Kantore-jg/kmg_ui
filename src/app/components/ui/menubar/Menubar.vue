<script setup>
import { MenubarRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  defaultValue: { type: String, default: undefined },
  modelValue: { type: String, default: undefined },
  dir: { type: String, default: undefined },
  loop: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <MenubarRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    :class="cn(
      'bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs',
      props.class
    )"
  >
    <slot />
  </MenubarRoot>
</template>
