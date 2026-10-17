<script setup>
import { ComboboxInput } from 'radix-vue'
import { Search } from 'lucide-vue-next'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <div
    class="flex h-9 items-center gap-2 border-b px-3"
    data-slot="command-input-wrapper"
  >
    <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <ComboboxInput
      :class="cn(
        'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
    />
  </div>
</template>
