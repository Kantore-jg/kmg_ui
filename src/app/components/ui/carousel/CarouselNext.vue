<script setup>
import { inject } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import Button from '../Button.vue'
import { cn } from '@/app/components/ui/utils'

const { orientation, scrollNext, canScrollNext } = inject('carousel')
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
        ? 'top-1/2 -right-12 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class
    )"
    :disabled="!canScrollNext"
    @click="scrollNext"
  >
    <ArrowRight class="size-4" />
    <span class="sr-only">Next slide</span>
  </Button>
</template>
