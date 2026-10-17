<script setup>
import { ref, computed, watch } from 'vue';
import { Search } from 'lucide-vue-next';
import { sameId } from '../utils/ids.js';
import {
  getProvinceOptions,
  getCommuneOptions,
  getZoneOptions,
  getCollineOptions,
  getAdministrativeLocationLabel,
} from '../utils/burundiLocations.js';
import PublicProductCard from './PublicProductCard.vue';

const props = defineProps({
  products: { type: Array, default: () => [] },
  markets: { type: Array, default: () => [] },
  productCategories: { type: Array, default: () => [] },
  onSelectProduct: { type: Function, required: true },
});

const globalProdQuery = ref('');
const globalProdCat = ref('all');
const globalProdProvince = ref('all');
const globalProdCommune = ref('all');
const globalProdZone = ref('all');
const globalProdColline = ref('all');

const getMarketById = (marketId) => props.markets.find((market) => sameId(market.id, marketId));

const provinceOptions = computed(() => getProvinceOptions());
const communeOptions = computed(() => {
  if (globalProdProvince.value === 'all') return [];
  return getCommuneOptions(globalProdProvince.value);
});
const zoneOptions = computed(() => {
  if (globalProdProvince.value === 'all' || globalProdCommune.value === 'all') return [];
  return getZoneOptions(globalProdProvince.value, globalProdCommune.value);
});
const collineOptions = computed(() => {
  if (globalProdProvince.value === 'all' || globalProdCommune.value === 'all' || globalProdZone.value === 'all') return [];
  return getCollineOptions(globalProdProvince.value, globalProdCommune.value, globalProdZone.value);
});

watch(globalProdProvince, () => {
  globalProdCommune.value = 'all';
  globalProdZone.value = 'all';
  globalProdColline.value = 'all';
});

watch(globalProdCommune, () => {
  globalProdZone.value = 'all';
  globalProdColline.value = 'all';
});

watch(globalProdZone, () => {
  globalProdColline.value = 'all';
});

const filteredProducts = computed(() =>
  props.products.filter((p) => {
    const query = globalProdQuery.value.toLowerCase();
    const market = getMarketById(p.marketId);
    const marketLocation = market ? getAdministrativeLocationLabel(market).toLowerCase() : '';
    const matchesQuery =
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      marketLocation.includes(query);
    const matchesCat = globalProdCat.value === 'all' || p.category === globalProdCat.value;
    const marketProvince = (market?.province || '').toLowerCase();
    const marketCommune = (market?.commune || '').toLowerCase();
    const marketZone = (market?.zone || '').toLowerCase();
    const marketColline = (market?.colline || '').toLowerCase();
    const matchesProvince = globalProdProvince.value === 'all' || marketProvince === globalProdProvince.value.toLowerCase();
    const matchesCommune = globalProdCommune.value === 'all' || marketCommune === globalProdCommune.value.toLowerCase();
    const matchesZone = globalProdZone.value === 'all' || marketZone === globalProdZone.value.toLowerCase();
    const matchesColline = globalProdColline.value === 'all' || marketColline === globalProdColline.value.toLowerCase();
    return matchesQuery && matchesCat && matchesProvince && matchesCommune && matchesZone && matchesColline;
  }),
);
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
    <div class="space-y-1.5">
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Catalogue Digital des Produits du Burundi
      </h1>
      <p class="text-slate-500 text-sm max-w-xl font-medium">
        Comparez les tarifs indicatifs arrêtés par les mairies provinciales.
      </p>
    </div>

    <div class="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="w-full md:w-80 flex items-center gap-2 px-3 py-2 bg-background border border-slate-200/60 rounded-xl focus-within:bg-white focus-within:border-primary/30 transition-all">
        <Search class="w-4 h-4 text-slate-400" />
        <input
          v-model="globalProdQuery"
          type="text"
          placeholder="Filtrer par nom (ex. Mukeke, Banane...)"
          class="bg-transparent border-0 outline-none text-xs w-full text-slate-700"
        />
      </div>
      <div class="flex flex-wrap gap-2.5 w-full md:w-auto">
        <select
          v-model="globalProdCat"
          class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700"
        >
          <option value="all">Secteur / Tout</option>
          <option v-for="cat in productCategories" :key="cat.id" :value="cat.name">
            {{ cat.name }}
          </option>
        </select>
        <select
          v-model="globalProdProvince"
          class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700"
        >
          <option value="all">Province / Tout</option>
          <option v-for="province in provinceOptions" :key="province.value" :value="province.value">
            {{ province.label }}
          </option>
        </select>
        <select
          v-model="globalProdCommune"
          :disabled="globalProdProvince === 'all'"
          class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Commune / Tout</option>
          <option v-for="commune in communeOptions" :key="commune.value" :value="commune.value">
            {{ commune.label }}
          </option>
        </select>
        <select
          v-model="globalProdZone"
          :disabled="globalProdProvince === 'all' || globalProdCommune === 'all'"
          class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Zone / Tout</option>
          <option v-for="zone in zoneOptions" :key="zone.value" :value="zone.value">
            {{ zone.label }}
          </option>
        </select>
        <select
          v-model="globalProdColline"
          :disabled="globalProdProvince === 'all' || globalProdCommune === 'all' || globalProdZone === 'all'"
          class="bg-background hover:bg-slate-100/60 border border-slate-200/60 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">Colline / Tout</option>
          <option v-for="colline in collineOptions" :key="colline.value" :value="colline.value">
            {{ colline.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="text-center py-12 bg-white rounded-2xl border border-slate-150 text-slate-400 font-medium text-xs">
      Aucun aliment ou produit trouvé pour ces paramètres.
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <PublicProductCard
        v-for="p in filteredProducts"
        :key="p.id"
        :product="p"
        :market-name="getMarketById(p.marketId)?.name || '—'"
        :on-select-product="onSelectProduct"
      />
    </div>
  </div>
</template>
