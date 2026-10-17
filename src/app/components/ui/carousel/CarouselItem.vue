<script setup>
import { inject } from 'vue'
import { cn } from '@/app/components/ui/utils'

const { orientation } = inject('carousel')
const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0 basis-full',
      orientation === 'horizontal' ? 'pl-4' : 'pt-4',
      props.class
    )"
  >
    <slot />
  </div>
</template>
