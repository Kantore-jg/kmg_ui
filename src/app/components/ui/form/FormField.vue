<script setup>
import { Field as VeeField } from 'vee-validate'
import { provide } from 'vue'
import { FORM_FIELD_INJECTION_KEY } from './useFormField'

const props = defineProps({
  name: { type: String, required: true },
})

provide(FORM_FIELD_INJECTION_KEY, { name: props.name })
</script>

<template>
  <VeeField v-bind="props" v-slot="slotProps">
    <slot v-bind="slotProps" />
  </VeeField>
</template>
