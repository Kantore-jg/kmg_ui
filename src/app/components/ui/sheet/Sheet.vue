<script setup>
import { DialogRoot } from 'radix-vue' // Sheet uses Dialog primitive

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:open'])
</script>

<template>
  <DialogRoot v-bind="props" @update:open="emit('update:open', $event)">
    <slot />
  </DialogRoot>
</template>
