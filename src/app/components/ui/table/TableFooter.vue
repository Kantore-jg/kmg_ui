<script setup>
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <tfoot :class="cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', props.class)">
    <slot />
  </tfoot>
</template>
