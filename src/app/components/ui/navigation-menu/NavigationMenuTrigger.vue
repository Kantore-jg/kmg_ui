<script setup>
import { NavigationMenuTrigger } from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'
import { navigationMenuTriggerStyle } from './utils.js'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <NavigationMenuTrigger
    :class="cn(navigationMenuTriggerStyle(), 'group', props.class)"
  >
    <slot />
    <ChevronDown
      class="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuTrigger>
</template>
