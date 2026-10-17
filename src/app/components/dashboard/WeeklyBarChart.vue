<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  data: { type: Array, default: () => [] },
  valueSuffix: { type: String, default: '' },
});

const maxValue = (data) => Math.max(...data.map((d) => d.value), 1);
</script>

<template>
  <div class="bs-card p-5">
    <h3 class="text-base font-semibold text-foreground">{{ title }}</h3>
    <p v-if="subtitle" class="text-sm text-muted-foreground mt-0.5 mb-5">{{ subtitle }}</p>

    <div v-if="!data.length" class="text-sm text-muted-foreground py-8 text-center">
      Aucune donnée disponible
    </div>

    <div v-else class="flex items-end justify-between gap-2 h-40">
      <div
        v-for="(item, idx) in data"
        :key="idx"
        class="flex-1 flex flex-col items-center gap-2 min-w-0"
      >
        <span
          v-if="item.value > 0"
          class="text-[10px] font-bold text-primary"
        >
          {{ item.value }}{{ valueSuffix }}
        </span>
        <div class="w-full flex justify-center items-end h-28">
          <div
            class="w-full max-w-8 rounded-t-md transition-all duration-500"
            :class="item.value === maxValue(data) ? 'bg-primary' : 'bg-muted'"
            :style="{ height: `${Math.max(8, (item.value / maxValue(data)) * 100)}%` }"
          />
        </div>
        <span class="text-[10px] text-muted-foreground truncate w-full text-center">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>