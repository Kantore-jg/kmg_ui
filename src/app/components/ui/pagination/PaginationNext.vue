<script setup>
import PaginationLink from './PaginationLink.vue'
import { ChevronRight } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    :class="cn('gap-1 px-2.5 sm:pr-2.5', props.class)"
  >
    <span class="hidden sm:block">Next</span>
    <ChevronRight class="h-4 w-4" />
  </PaginationLink>
</template>
