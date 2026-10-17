<script setup>
import { DrawerDescription } from 'vaul-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <DrawerDescription :class="cn('text-muted-foreground text-sm', props.class)">
    <slot />
  </DrawerDescription>
</template>
