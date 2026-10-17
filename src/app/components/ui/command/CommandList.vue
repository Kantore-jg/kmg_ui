<script setup>
import { ComboboxContent } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <ComboboxContent
    :class="cn(
      'max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto',
      props.class
    )"
  >
    <slot />
  </ComboboxContent>
</template>
