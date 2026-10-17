<script setup>
import { cn } from '../utils'

const props = defineProps({
  class: { type: String, default: '' }
})
</script>

<template>
  <div :class="cn('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border', props.class)">
    <slot />
  </div>
</template>
