<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  segments: { type: Array, default: () => [] },
});

const total = computed(() =>
  props.segments.reduce((sum, s) => sum + s.value, 0),
);

const formattedSegments = computed(() => {
  if (!total.value) return [];
  return props.segments.map((s) => ({
    ...s,
    percent: Math.round((s.value / total.value) * 100),
    amount: Number(s.value).toLocaleString('fr-FR'),
  }));
});

const conicGradient = computed(() => {
  if (!total.value) return 'conic-gradient(#e5e7eb 0deg 360deg)';
  let angle = 0;
  const parts = formattedSegments.value.map((s) => {
    const slice = (s.value / total.value) * 360;
    const start = angle;
    angle += slice;
    return `${s.color} ${start}deg ${angle}deg`;
  });
  return `conic-gradient(${parts.join(', ')})`;
});

const mainPercent = computed(() => formattedSegments.value[0]?.percent ?? 0);
</script>

<template>
  <div class="bs-card p-5">
    <h3 class="text-base font-semibold text-foreground">{{ title }}</h3>
    <p v-if="subtitle" class="text-sm text-muted-foreground mt-0.5 mb-5">{{ subtitle }}</p>

    <div class="flex flex-col sm:flex-row items-center gap-6">
      <div class="relative w-32 h-32 shrink-0">
        <div
          class="w-full h-full rounded-full"
          :style="{ background: conicGradient }"
        />
        <div class="absolute inset-4 rounded-full bg-card flex items-center justify-center">
          <span class="text-xl font-bold text-foreground">{{ mainPercent }}%</span>
        </div>
      </div>

      <div class="flex-1 space-y-3 w-full">
        <div
          v-for="seg in formattedSegments"
          :key="seg.label"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: seg.color }" />
            <span class="text-muted-foreground">{{ seg.label }}</span>
            <span class="text-xs text-muted-foreground">({{ seg.percent }}%)</span>
          </div>
          <span class="font-medium">{{ seg.amount }} BIF</span>
        </div>
      </div>
    </div>
  </div>
</template>