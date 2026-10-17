<script setup>
import { DrawerRoot } from 'vaul-vue'

const props = defineProps({
  shouldScaleBackground: { type: Boolean, default: true },
  activeSnapPoint: { type: [String, Number, null], default: undefined },
  closeThreshold: { type: Number, default: undefined },
  shouldSnapButtons: { type: Boolean, default: undefined },
  snapPoints: { type: Array, default: undefined },
  fadeFromIndex: { type: Number, default: undefined },
  modal: { type: Boolean, default: true },
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: undefined },
  nested: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'update:activeSnapPoint'])
</script>

<template>
  <DrawerRoot
    v-bind="props"
    @update:open="emit('update:open', $event)"
    @update:activeSnapPoint="emit('update:activeSnapPoint', $event)"
  >
    <slot />
  </DrawerRoot>
</template>
