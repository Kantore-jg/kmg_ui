<script setup>
import { Trash2 } from 'lucide-vue-next';

defineProps({
  showClear: { type: Boolean, default: false },
});

const emit = defineEmits(['clear']);
</script>

<template>
  <div class="bs-filter-bar">
    <slot />
    <button
      v-if="showClear"
      type="button"
      class="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-card shrink-0"
      title="Effacer les filtres"
      @click="emit('clear')"
    >
      <Trash2 class="w-4 h-4" />
    </button>
  </div>
</template>