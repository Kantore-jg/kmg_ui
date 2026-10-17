<script setup>
import { cn } from '../utils'

const props = defineProps({
  class: { type: String, default: '' }
})
</script>

<template>
  <div :class="cn('px-6 [&:last-child]:pb-6', props.class)">
    <slot />
  </div>
</template>
