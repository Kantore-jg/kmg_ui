<script setup>
import { cn } from '@/app/components/ui/utils'
import { provide, useId } from 'vue'
import { FORM_ITEM_INJECTION_KEY } from './useFormField'

const props = defineProps({
  class: { type: String, default: '' },
})

const id = useId()
provide(FORM_ITEM_INJECTION_KEY, id)
</script>

<template>
  <div :class="cn('space-y-2', props.class)">
    <slot />
  </div>
</template>
