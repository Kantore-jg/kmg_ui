<script setup>
import { NavigationMenuRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'
import NavigationMenuViewport from './NavigationMenuViewport.vue'

const props = defineProps({
  defaultValue: { type: String, default: undefined },
  modelValue: { type: String, default: undefined },
  dir: { type: String, default: undefined },
  orientation: { type: String, default: 'horizontal' },
  delayDuration: { type: Number, default: 200 },
  skipDelayDuration: { type: Number, default: 300 },
  viewport: { type: Boolean, default: true },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <NavigationMenuRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    :class="cn(
      'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
      props.class
    )"
  >
    <slot />
    <NavigationMenuViewport v-if="props.viewport" />
  </NavigationMenuRoot>
</template>
