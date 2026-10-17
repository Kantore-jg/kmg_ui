<script setup>
import { computed } from "vue";
import { ToastViewport } from "radix-vue";
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
  <ToastViewport
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-13 sm:right-0 sm:bottom-auto sm:flex-col md:max-w-[420px]',
        props.class,
      )
    "
  />
</template>
