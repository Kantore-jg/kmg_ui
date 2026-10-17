<script setup>
import { DropdownMenuLabel } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  inset: { type: Boolean, default: false },
  asChild: { type: Boolean, default: false },
  class: { type: String, default: '' }
})
</script>

<template>
  <DropdownMenuLabel
    :as-child="asChild"
    :class="cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
