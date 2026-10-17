<script setup>
import { computed } from "vue";
import { ToastDescription } from "radix-vue";
import { cn } from "../utils";

const props = defineProps({
  asChild: { type: Boolean, default: false },
  as: { type: null, default: undefined },
  class: { type: String, default: "" },
});

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ToastDescription
    v-bind="delegatedProps"
    :class="cn('text-sm opacity-90', props.class)"
  >
    <slot />
  </ToastDescription>
</template>
