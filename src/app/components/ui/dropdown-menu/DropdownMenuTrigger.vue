<script setup>
import { DropdownMenuTrigger } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
  class: { type: String, default: '' }
})
</script>

<template>
  <DropdownMenuTrigger :as-child="props.asChild" :class="props.class">
    <slot />
  </DropdownMenuTrigger>
</template>
