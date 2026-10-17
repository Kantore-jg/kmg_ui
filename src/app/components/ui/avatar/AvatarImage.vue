<script setup>
import { AvatarImage } from 'radix-vue'
import { cn } from '../utils'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  class: { type: String, default: '' }
})
</script>

<template>
  <AvatarImage :src="props.src" :alt="props.alt" :class="cn('aspect-square size-full', props.class)" />
</template>
