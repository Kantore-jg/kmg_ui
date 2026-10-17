<script setup>
import { MoreHorizontal } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <span
    aria-hidden="true"
    :class="cn('flex size-9 items-center justify-center', props.class)"
  >
    <MoreHorizontal class="size-4" />
    <span class="sr-only">More pages</span>
  </span>
</template>
