<script setup>
import { Toaster as Sonner } from 'vue-sonner'
// No next-themes in this setup presumably, or we can add it later.
// Assuming we don't have useTheme hook identical to next-themes in Vue easily without a lib.
// We'll default to 'system' or props.

const props = defineProps({
  theme: { type: String, default: 'system' }, // 'light' | 'dark' | 'system'
})
</script>

<template>
  <Sonner
    :theme="props.theme"
    class="toaster group"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      }
    }"
  />
</template>
