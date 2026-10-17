<script setup>
import { AspectRatio } from 'radix-vue'

const props = defineProps({
  ratio: { type: Number, default: 1 },
})
</script>

<template>
  <AspectRatio :ratio="props.ratio">
    <slot />
  </AspectRatio>
</template>
