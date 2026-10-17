<script setup>
import { cn } from '@/app/components/ui/utils'
import { useFormField } from './useFormField'

const props = defineProps({
  class: { type: String, default: '' },
})

const { formDescriptionId } = useFormField()
</script>

<template>
  <p
    :id="formDescriptionId"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </p>
</template>
