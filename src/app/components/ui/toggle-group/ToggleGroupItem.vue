<script setup>
import { ToggleGroupItem } from 'radix-vue'
import { inject } from 'vue'
import { cn } from '@/app/components/ui/utils'
import { toggleVariants } from '../Toggle.vue'

const context = inject('toggleGroup')

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: undefined },
  variant: { type: String, default: undefined },
  size: { type: String, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <ToggleGroupItem
    v-bind="props"
    :class="cn(
      toggleVariants({
        variant: context?.variant || props.variant,
        size: context?.size || props.size,
      }),
      'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
      props.class
    )"
  >
    <slot />
  </ToggleGroupItem>
</template>
