<script setup>
import { ComboboxGroup, ComboboxLabel } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  heading: { type: String, default: undefined },
  class: { type: String, default: '' },
})
</script>

<template>
  <ComboboxGroup
    :class="cn(
      'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
      props.class
    )"
  >
    <ComboboxLabel v-if="props.heading" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
      {{ props.heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
