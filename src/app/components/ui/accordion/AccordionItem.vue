<script setup>
import { AccordionItem } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <AccordionItem
    v-bind="props"
    :class="cn('border-b last:border-b-0', props.class)"
  >
    <slot />
  </AccordionItem>
</template>
