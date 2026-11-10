<script setup>
import { cn } from './utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  class: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    :class="cn(
      'flex h-10 w-full min-w-0 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 file:mr-3 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-60 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 aria-invalid:border-red-400 aria-invalid:ring-red-500/20',
      props.class
    )"
  />
</template>
