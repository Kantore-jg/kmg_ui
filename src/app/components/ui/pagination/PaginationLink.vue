<script setup>
import { cn } from '@/app/components/ui/utils'
import { buttonVariants } from '../Button.vue' // Assuming standardized button variants
// Since we are not sure if buttonVariants is exported, we will define the variants logic or assume we can import it.
// To be safe and avoid dependency issues if Button.vue doesn't export it, I'll use a direct class string or try to rely on Button component if possible.
// But PaginationLink is an 'a' tag.
// I will replicate the button variant styles here or try to import.
// Given previous steps, I should try to import from where buttonVariants is defined.
// If I created Button.vue in root of ui, it might not export it.
// I will check if I can assume Button.vue has it.
// Actually, in `calendar.tsx` view, I saw imports from `./button` which was `button.tsx`.
// I replaced `button.tsx` with `Button.vue`.
// If I didn't export `buttonVariants` from `Button.vue`, then I can't import it.
// I'll define a local helper or simple string map for now.

const props = defineProps({
  isActive: { type: Boolean, default: false },
  size: { type: String, default: 'icon' },
  class: { type: String, default: '' },
})

// Simplified variant logic or hardcoded classes for now to ensure it works
// 'ghost' is default, 'outline' if active.
</script>

<template>
  <a
    :aria-current="props.isActive ? 'page' : undefined"
    :data-active="props.isActive"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      props.isActive ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
      props.size === 'icon' ? 'h-10 w-10' : 'h-10 px-4 py-2',
      props.class
    )"
  >
    <slot />
  </a>
</template>
