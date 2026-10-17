<script setup>
import { computed } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '../utils'

const props = defineProps({
  defaultChecked: {
    type: Boolean,
    default: undefined,
  },
  checked: {
    type: Boolean,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: undefined,
  },
  value: {
    type: String,
    default: 'on',
  },
  id: {
    type: String,
    default: undefined,
  },
  class: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:checked'])

const modelValue = computed({
  get: () => props.checked,
  set: (value) => emit('update:checked', value),
})
</script>

<template>
  <CheckboxRoot
    v-model:checked="modelValue"
    :disabled="disabled"
    :required="required"
    :name="name"
    :value="value"
    :id="id"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class
    )"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-4 w-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
