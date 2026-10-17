<script setup>
import { Label } from 'radix-vue'
import { cn } from './utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
  class: { type: String, default: '' }
})
</script>

<template>
  <Label
    :as-child="asChild"
    :class="cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      props.class
    )"
  >
    <slot />
  </Label>
</template>
