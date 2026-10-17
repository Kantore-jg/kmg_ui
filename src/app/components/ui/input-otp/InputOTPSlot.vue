<script setup>
import { PinInputInput } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  index: { type: Number, required: true },
  class: { type: String, default: '' },
})
</script>

<template>
  <PinInputInput
    :index="props.index"
    :class="cn(
      'bg-background h-9 w-9 border border-input text-center text-sm shadow-sm transition-all rounded-md focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none',
      props.class
    )"
  />
</template>
