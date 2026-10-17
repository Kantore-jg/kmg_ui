<script setup>
import { MenubarLabel } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  inset: { type: Boolean, default: false },
  class: { type: String, default: '' },
})
</script>

<template>
  <MenubarLabel
    :class="cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
    :data-inset="props.inset"
  >
    <slot />
  </MenubarLabel>
</template>
