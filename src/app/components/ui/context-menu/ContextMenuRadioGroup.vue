<script setup>
import { ContextMenuRadioGroup } from 'radix-vue'

const props = defineProps({
  value: { type: String, default: undefined },
})

const emit = defineEmits(['update:value'])
</script>

<template>
  <ContextMenuRadioGroup v-bind="props" @update:value="emit('update:value', $event)">
    <slot />
  </ContextMenuRadioGroup>
</template>
