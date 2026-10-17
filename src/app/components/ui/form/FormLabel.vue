<script setup>
import { Label } from '../label'
import { cn } from '@/app/components/ui/utils'
import { useFormField } from './useFormField'

const props = defineProps({
  class: { type: String, default: '' },
})

const { error, formItemId } = useFormField()
</script>

<template>
  <Label
    :class="cn(error && 'text-destructive', props.class)"
    :for="formItemId"
  >
    <slot />
  </Label>
</template>
