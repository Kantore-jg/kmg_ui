<script setup>
import { AvatarRoot } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  class: { type: String, default: '' }
})
</script>

<template>
  <AvatarRoot :class="cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', props.class)">
    <slot />
  </AvatarRoot>
</template>
