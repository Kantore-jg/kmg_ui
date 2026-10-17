<script setup>
import { AlertDialogTitle } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <AlertDialogTitle :class="cn('text-lg font-semibold', props.class)">
    <slot />
  </AlertDialogTitle>
</template>
