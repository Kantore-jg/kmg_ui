<script setup>
import { DropdownMenuRoot } from 'radix-vue'

const props = defineProps({
  defaultOpen: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
  dir: { type: String, default: undefined },
  modal: { type: Boolean, default: true },
})

const emits = defineEmits(['update:open'])
</script>

<template>
  <DropdownMenuRoot v-bind="props" @update:open="emits('update:open', $event)">
    <slot />
  </DropdownMenuRoot>
</template>
