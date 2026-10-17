<script setup>
import { CheckboxRoot, CheckboxIndicator } from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from './utils'

const props = defineProps({
  checked: { type: [Boolean, String], default: undefined },
  defaultChecked: { type: Boolean, default: undefined },
  required: { type: Boolean, default: undefined },
  name: { type: String, default: undefined },
  disabled: { type: Boolean, default: undefined },
  value: { type: String, default: undefined },
  id: { type: String, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:checked'])
</script>

<template>
  <CheckboxRoot
    v-bind="props"
    @update:checked="emit('update:checked', $event)"
    :class="cn(
      'peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current transition-none">
      <Check class="size-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
