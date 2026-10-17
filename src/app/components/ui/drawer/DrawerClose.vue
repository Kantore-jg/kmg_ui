<script setup>
import { DrawerClose } from 'vaul-vue'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DrawerClose v-bind="props">
    <slot />
  </DrawerClose>
</template>
