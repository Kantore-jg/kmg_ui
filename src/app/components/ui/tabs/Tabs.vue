<script setup>
import { TabsRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  defaultValue: { type: String, default: undefined },
  modelValue: { type: String, default: undefined },
  activationMode: { type: String, default: 'automatic' },
  orientation: { type: String, default: 'horizontal' },
  dir: { type: String, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <TabsRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    :class="cn('flex flex-col gap-2', props.class)"
  >
    <slot />
  </TabsRoot>
</template>
