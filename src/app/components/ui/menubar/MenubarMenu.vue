<script setup>
import { MenubarMenu } from 'radix-vue'

const props = defineProps({
  value: { type: String, default: undefined },
})
</script>

<template>
  <MenubarMenu v-bind="props">
    <slot />
  </MenubarMenu>
</template>
