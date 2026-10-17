<script setup>
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaCorner } from 'radix-vue'
import ScrollBar from './ScrollBar.vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  type: { type: String, default: undefined },
  dir: { type: String, default: undefined },
  scrollHideDelay: { type: Number, default: 600 },
  class: { type: String, default: '' },
})
</script>

<template>
  <ScrollAreaRoot
    v-bind="props"
    :class="cn('relative overflow-hidden', props.class)"
  >
    <ScrollAreaViewport class="h-full w-full rounded-[inherit] focus:outline-none focus:ring-1 focus:ring-ring">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
