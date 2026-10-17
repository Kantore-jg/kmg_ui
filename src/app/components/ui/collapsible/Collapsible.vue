<script setup>
import { CollapsibleRoot } from 'radix-vue'

const props = defineProps({
  defaultOpen: { type: Boolean, default: undefined },
  open: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:open'])
</script>

<template>
  <CollapsibleRoot
    v-bind="props"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </CollapsibleRoot>
</template>
