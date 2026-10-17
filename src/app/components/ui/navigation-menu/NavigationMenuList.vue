<script setup>
import { NavigationMenuList } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <NavigationMenuList
    :class="cn(
      'group flex flex-1 list-none items-center justify-center gap-1',
      props.class
    )"
  >
    <slot />
  </NavigationMenuList>
</template>
