<script setup>
import { computed } from "vue";
import { ToastProvider } from "radix-vue";

const props = defineProps({
  swipeDirection: { type: String, default: "right" },
  swipeThreshold: { type: Number, default: 50 },
  label: { type: String, default: "Notification" },
  duration: { type: Number, default: 5000 },
});

const delegatedProps = computed(() => {
  const { ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ToastProvider v-bind="delegatedProps">
    <slot />
  </ToastProvider>
</template>
