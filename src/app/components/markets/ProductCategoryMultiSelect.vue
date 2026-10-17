<script setup>
import { computed } from 'vue';
import { Check, ChevronDown } from 'lucide-vue-next';
import Button from '../ui/Button.vue';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Sélectionner des catégories...' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

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
  <Popover>
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        :disabled="disabled || !options.length"
        :class="cn(
          'w-full justify-between font-normal h-9 px-3',
          !selectedLabels.length && 'text-muted-foreground',
        )"
      >
        <span class="truncate text-left">{{ displayLabel }}</span>
        <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-[var(--radix-popover-trigger-width)] p-1" align="start">
      <div v-if="!options.length" class="px-2 py-6 text-center text-sm text-muted-foreground">
        Aucune catégorie disponible
      </div>
      <div v-else class="max-h-60 overflow-y-auto">
        <button
          v-for="category in options"
          :key="category.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          @click="toggleCategory(category.id)"
        >
          <Check
            :class="cn(
              'h-4 w-4 shrink-0',
              isSelected(category.id) ? 'opacity-100' : 'opacity-0',
            )"
          />
          <span>{{ category.name }}</span>
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>