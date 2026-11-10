<script>
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-sky-600 text-white hover:bg-sky-700",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900",
        link: "text-sky-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3 rounded-sm",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
</script>

<script setup>
import { Primitive } from "radix-vue";
import { cn } from "./utils";

const props = defineProps({
  variant: { type: String, default: "default" },
  size: { type: String, default: "default" },
  asChild: { type: Boolean, default: false },
  class: { type: String, default: "" },
});
</script>

<template>
  <Primitive
    :as="asChild ? 'template' : 'button'"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size, className: props.class }))"
  >
    <slot />
  </Primitive>
</template>
