<script setup>
import { cn } from './utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <div :class="cn('bg-accent animate-pulse rounded-md', props.class)" />
</template>
