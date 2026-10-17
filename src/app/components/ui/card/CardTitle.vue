<script setup>
import { cn } from '../utils'

const props = defineProps({
  class: { type: String, default: '' }
})
</script>

<template>
  <h4 :class="cn('leading-none text-lg font-semibold', props.class)">
    <slot />
  </h4>
</template>
