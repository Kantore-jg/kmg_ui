<script setup>
import PaginationLink from './PaginationLink.vue'
import { ChevronLeft } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    :class="cn('gap-1 px-2.5 sm:pl-2.5', props.class)"
  >
    <ChevronLeft class="h-4 w-4" />
    <span class="hidden sm:block">Previous</span>
  </PaginationLink>
</template>
