<script setup>
import { TabsContent } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: String, required: true },
  forceMount: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <TabsContent
    v-bind="props"
    :class="cn('flex-1 outline-none', props.class)"
  >
    <slot />
  </TabsContent>
</template>
