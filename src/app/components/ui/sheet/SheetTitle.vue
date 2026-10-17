<script setup>
import { DialogTitle } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <DialogTitle :class="cn('text-foreground font-semibold', props.class)">
    <slot />
  </DialogTitle>
</template>
