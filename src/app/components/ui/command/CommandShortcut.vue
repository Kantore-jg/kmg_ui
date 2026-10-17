<script setup>
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <span :class="cn('text-muted-foreground ml-auto text-xs tracking-widest', props.class)">
    <slot />
  </span>
</template>
