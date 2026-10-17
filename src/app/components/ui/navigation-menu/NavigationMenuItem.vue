<script setup>
import { NavigationMenuItem } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  value: { type: String, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <NavigationMenuItem :class="cn('relative', props.class)" :value="props.value">
    <slot />
  </NavigationMenuItem>
</template>
