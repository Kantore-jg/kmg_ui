<script setup>
import { ComboboxSeparator } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <ComboboxSeparator :class="cn('bg-border -mx-1 h-px', props.class)" />
</template>
