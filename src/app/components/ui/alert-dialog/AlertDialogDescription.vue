<script setup>
import { AlertDialogDescription } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <AlertDialogDescription :class="cn('text-muted-foreground text-sm', props.class)">
    <slot />
  </AlertDialogDescription>
</template>
