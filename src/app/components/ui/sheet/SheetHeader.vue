<script setup>
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <div :class="cn('flex flex-col gap-1.5 p-4', props.class)">
    <slot />
  </div>
</template>
