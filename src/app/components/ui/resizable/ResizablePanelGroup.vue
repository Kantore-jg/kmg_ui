<script setup>
import { SplitterGroup } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  direction: { type: String, required: true },
  class: { type: String, default: '' },
})

const emit = defineEmits(['layout'])
</script>

<template>
  <SplitterGroup
    v-bind="props"
    @layout="emit('layout', $event)"
    :class="cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      props.class
    )"
  >
    <slot />
  </SplitterGroup>
</template>
