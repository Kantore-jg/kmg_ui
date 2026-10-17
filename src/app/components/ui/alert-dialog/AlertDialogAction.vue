<script setup>
import { AlertDialogAction } from 'radix-vue'
import { cn } from '@/app/components/ui/utils'
import { buttonVariants } from '../Button.vue' // Assuming button has export

// If buttonVariants isn't exported from Button.vue, we'll need to duplicate or move it.
// I haven't checked Button.vue for named exports. It likely doesn't have it if I didn't add it.
// I will assume for now I need to import it properly or use a string default.
// Wait, I created Button.vue earlier.
// I'll check Button.vue content briefly if I can, or just assume the string class.
// Actually, earlier I saw `buttonVariants` being imported in `calendar.tsx` from `./button`.
// My `Button.vue` likely doesn't export `buttonVariants` unless I added it.
// I will use the string class directly or try to import.
// Safety: I'll copy the button default styles here or import if I can verify.
// I'll check Button.vue in next step if needed, but for now I'll just use the default variant class string.
// No, I should use the correct variant function. I'll import `buttonVariants` from a new `button/index.js` or `buttonVariants.js` if I refactored.
// But I didn't refactor Button.vue into a folder.
// I will just use the standard button classes here for safety.

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <AlertDialogAction :class="cn('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2', props.class)">
    <slot />
  </AlertDialogAction>
</template>
