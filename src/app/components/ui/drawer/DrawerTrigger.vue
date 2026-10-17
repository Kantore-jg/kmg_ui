<script setup>
import { DrawerTrigger } from 'vaul-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DrawerTrigger v-bind="props">
    <slot />
  </DrawerTrigger>
</template>
