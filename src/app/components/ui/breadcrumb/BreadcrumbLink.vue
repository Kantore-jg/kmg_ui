<script setup>
import { Primitive } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
  as: { type: [String, Object], default: 'a' },
  class: { type: String, default: '' },
})
</script>

<template>
  <Primitive
    :as="asChild ? 'template' : props.as"
    :as-child="asChild"
    :class="cn('hover:text-foreground transition-colors', props.class)"
  >
    <slot />
  </Primitive>
</template>
