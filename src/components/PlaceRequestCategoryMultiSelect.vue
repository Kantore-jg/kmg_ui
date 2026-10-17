<script setup>
import { ref, computed } from 'vue';
import { Check, ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Choisir les catégories...' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const open = ref(false);

const selectedIds = computed(() =>
  props.modelValue.map((id) => Number(id)).filter((id) => !Number.isNaN(id)),
);

const selectedLabels = computed(() =>
  props.options
    .filter((opt) => selectedIds.value.includes(Number(opt.id)))
    .map((opt) => opt.name),
);

const displayLabel = computed(() => {
  if (!selectedLabels.value.length) return props.placeholder;
  if (selectedLabels.value.length <= 2) return selectedLabels.value.join(', ');
  return `${selectedLabels.value.slice(0, 2).join(', ')} (+${selectedLabels.value.length - 2})`;
});

function isSelected(id) {
  return selectedIds.value.includes(Number(id));
}

function toggleCategory(id) {
  const numericId = Number(id);
  const next = new Set(selectedIds.value);
  if (next.has(numericId)) {
    next.delete(numericId);
  } else {
    next.add(numericId);
  }
  emit('update:modelValue', [...next]);
}
</script>

<template>
  <div class="relative w-full">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 bg-transparent border-0 outline-none text-xs cursor-pointer text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled || !options.length"
      @click="open = !open"
    >
      <span class="truncate text-left" :class="!selectedLabels.length && 'text-slate-400'">
        {{ displayLabel }}
      </span>
      <ChevronDown class="w-4 h-4 shrink-0 text-slate-400" :class="open && 'rotate-180'" />
    </button>

    <div
      v-if="open"
      class="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
    >
      <div v-if="!options.length" class="px-3 py-4 text-center text-xs text-slate-400">
        Aucune catégorie configurée pour ce marché
      </div>
      <div v-else class="max-h-48 overflow-y-auto p-1">
        <button
          v-for="category in options"
          :key="category.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
          @click="toggleCategory(category.id)"
        >
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
            :class="isSelected(category.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'"
          >
            <Check v-if="isSelected(category.id)" class="h-3 w-3" />
          </span>
          <span>{{ category.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>