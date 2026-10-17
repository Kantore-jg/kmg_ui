<script setup>
import { DrawerPortal, DrawerContent, DrawerOverlay } from 'vaul-vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay class="fixed inset-0 z-50 bg-black/80" />
    <DrawerContent
      :class="cn(
        'bg-background fixed z-50 flex h-auto flex-col border border-border',
        'inset-x-0 bottom-0 mt-24 max-h-[96%] rounded-t-[10px]',
        props.class
      )"
    >
      <div class="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
