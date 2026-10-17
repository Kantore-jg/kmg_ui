<script setup>
import { DropdownMenuSeparator } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
  class: { type: String, default: '' }
})
</script>

<template>
  <DropdownMenuSeparator
    :as-child="asChild"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>
