<script setup>
import { TabsList } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  loop: { type: Boolean, default: true },
  class: { type: String, default: '' },
})
</script>

<template>
  <TabsList
    v-bind="props"
    :class="cn(
      'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex',
      props.class
    )"
  >
    <slot />
  </TabsList>
</template>
