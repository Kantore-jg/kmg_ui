<script setup>
import { inject } from 'vue'
import { cn } from '@/app/components/ui/utils'

const { emblaNode, orientation } = inject('carousel')
const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <div ref="emblaNode" class="overflow-hidden">
    <div
      :class="cn(
        'flex',
        orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
        props.class
      )"
    >
      <slot />
    </div>
  </div>
</template>
