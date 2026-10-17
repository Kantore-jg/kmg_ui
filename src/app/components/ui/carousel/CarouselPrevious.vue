<script setup>
import { inject } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import Button from '../Button.vue' // Assuming Button is available
import { cn } from '@/app/components/ui/utils'

const { orientation, scrollPrev, canScrollPrev } = inject('carousel')
const props = defineProps({
  variant: { type: String, default: 'outline' },
  size: { type: String, default: 'icon' },
  class: { type: String, default: '' },
})
</script>

<template>
  <Button
    :variant="props.variant"
    :size="props.size"
    :class="cn(
      'absolute size-8 rounded-full',
      orientation === 'horizontal'
        ? 'top-1/2 -left-12 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class
    )"
    :disabled="!canScrollPrev"
    @click="scrollPrev"
  >
    <ArrowLeft class="size-4" />
    <span class="sr-only">Previous slide</span>
  </Button>
</template>
