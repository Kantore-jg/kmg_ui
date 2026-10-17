<script setup>
import { cn } from '@/app/components/ui/utils'
import { useFormField } from './useFormField'

const props = defineProps({
  class: { type: String, default: '' },
})

const { error, formMessageId } = useFormField()
</script>

<template>
  <p
    v-if="error"
    :id="formMessageId"
    :class="cn('text-destructive text-sm', props.class)"
  >
    {{ error }}
  </p>
  <slot v-else />
</template>
