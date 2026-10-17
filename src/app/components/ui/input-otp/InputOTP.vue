<script setup>
import { PinInputRoot } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  modelValue: { type: [String, Array], default: undefined },
  defaultValue: { type: [String, Array], default: undefined },
  placeholder: { type: String, default: undefined },
  name: { type: String, default: undefined },
  disabled: { type: Boolean, default: undefined },
  type: { type: String, default: undefined },
  mask: { type: Boolean, default: undefined },
  otp: { type: Boolean, default: undefined },
  class: { type: String, default: '' },
  containerClass: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'complete'])
</script>

<template>
  <PinInputRoot
    v-bind="props"
    @update:modelValue="emit('update:modelValue', $event)"
    @complete="emit('complete', $event)"
    :class="cn('flex items-center gap-2 has-disabled:opacity-50', props.containerClass)"
  >
    <div :class="cn('flex items-center gap-1', props.class)">
      <slot />
    </div>
  </PinInputRoot>
</template>
