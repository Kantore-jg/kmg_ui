<script setup>
import { PinInputGroup } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <PinInputGroup :class="cn('flex items-center gap-1', props.class)">
    <slot />
  </PinInputGroup>
</template>
