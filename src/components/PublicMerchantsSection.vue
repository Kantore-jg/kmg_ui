<script setup>
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import { sameId } from '../utils/ids.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import PublicMerchantCard from './PublicMerchantCard.vue';

const props = defineProps({
  merchants: { type: Array, default: () => [] },
  markets: { type: Array, default: () => [] },
  productCategories: { type: Array, default: () => [] },
  onSelectMerchant: { type: Function, required: true },
});

const merchantQuery = ref('');
const merchantCategory = ref('all');

const getMarketById = (marketId) => props.markets.find((market) => sameId(market.id, marketId));

const filteredMerchants = computed(() =>
  props.merchants.filter((m) => {
    const query = merchantQuery.value.toLowerCase();
    const matchesQuery = m.name.toLowerCase().includes(query) || m.category.toLowerCase().includes(query);
    const matchesCategory = merchantCategory.value === 'all' || m.category === merchantCategory.value;
    return matchesQuery && matchesCategory;
  }),
);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
    <div class="space-y-1.5">
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Public des Commerçants
      </h1>

    </div>

    <div class="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="w-full md:w-80 flex items-center gap-2 px-3 py-2 bg-background border border-slate-200/60 rounded-xl focus-within:bg-white focus-within:border-primary/30 transition-all">
        <Search class="w-4 h-4 text-slate-400" />
        <input
          v-model="merchantQuery"
          type="text"
          placeholder="Rechercher par nom d'exploitant ou filière..."
          class="bg-transparent border-0 outline-none text-xs w-full text-slate-700"
        />
      </div>
      <select
        v-model="merchantCategory"
        class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700 w-full md:w-auto"
      >
        <option value="all">Spécialité / Tout</option>
        <option v-for="cat in productCategories" :key="cat.id" :value="cat.name">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PublicMerchantCard
        v-for="m in filteredMerchants"
        :key="m.id"
        :merchant="m"
        :market-name="getMarketById(m.activeMarketId)?.name || ''"
        :market-location="getAdministrativeLocationLabel(getMarketById(m.activeMarketId)) || ''"
        :on-select-merchant="onSelectMerchant"
      />
    </div>
  </div>
</template>
