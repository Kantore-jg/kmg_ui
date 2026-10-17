<script setup>
import { AvatarFallback } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  delayMs: { type: Number, default: undefined },
  class: { type: String, default: '' }
})
</script>

<template>
  <AvatarFallback :delay-ms="props.delayMs" :class="cn('bg-muted flex size-full items-center justify-center rounded-full', props.class)">
    <slot />
  </AvatarFallback>
</template>
