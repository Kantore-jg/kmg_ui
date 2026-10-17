<script setup>
import { MenubarSeparator } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <MenubarSeparator :class="cn('bg-border -mx-1 my-1 h-px', props.class)" />
</template>
