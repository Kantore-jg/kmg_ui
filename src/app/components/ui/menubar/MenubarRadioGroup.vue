<script setup>
import { MenubarRadioGroup } from 'radix-vue'

const props = defineProps({
  value: { type: String, default: undefined },
})

const emit = defineEmits(['update:value'])
</script>

<template>
  <MenubarRadioGroup v-bind="props" @update:value="emit('update:value', $event)">
    <slot />
  </MenubarRadioGroup>
</template>
