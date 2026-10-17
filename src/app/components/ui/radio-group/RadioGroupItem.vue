<script setup>
import { RadioGroupItem, RadioGroupIndicator } from 'radix-vue'
import { Circle } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: undefined },
  required: { type: Boolean, default: undefined },
  name: { type: String, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <RadioGroupItem
    v-bind="props"
    :class="cn(
      'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <RadioGroupIndicator class="relative flex items-center justify-center">
      <Circle class="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
