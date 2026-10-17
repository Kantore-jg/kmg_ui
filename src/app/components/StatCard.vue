<script setup>
const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: [Object, Function], required: true },
  trend: { type: Object, default: null },
  subtitle: { type: String, default: '' },
  color: { type: String, default: 'primary' },
});

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-chart-4/10 text-chart-4',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  pink: 'bg-pink-100 text-pink-600',
};
</script>

<template>
  <div class="bs-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{{ props.title }}</p>
        <h3 class="text-2xl font-bold text-foreground tracking-tight">{{ props.value }}</h3>
        <p v-if="props.subtitle" class="text-xs text-muted-foreground mt-1">{{ props.subtitle }}</p>
        <div v-if="props.trend" class="mt-2 flex items-center gap-1">
          <span
            :class="[
              'text-xs font-medium',
              props.trend.isPositive ? 'text-success' : 'text-destructive',
            ]"
          >
            {{ props.trend.isPositive ? '↑' : '↓' }} {{ props.trend.value }}
          </span>
        </div>
      </div>
      <div :class="['bs-stat-icon', colorClasses[props.color] || colorClasses.primary]">
        <component :is="props.icon" class="w-5 h-5" />
      </div>
    </div>
  </div>
</template>