<script setup>
import { ref, computed, watch } from 'vue';
import { useApp } from '../composables/useApp.js';
import { fetchProducts } from '../api/services/data.js';
import { sameId } from '../utils/ids.js';
import { Search, Download, Trash2, ArrowUpDown, Loader2 } from 'lucide-vue-next';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';

const { markets, merchants, products: allProducts, initialized } = useApp();

const selectedMarket = ref('all');
const selectedProduct = ref('all');
const keyword = ref('');
const loading = ref(false);
const hasFiltered = ref(false);

const appliedMarket = ref('all');
const appliedProduct = ref('all');
const filteredRows = ref([]);

const sortKey = ref('name');
const sortDir = ref('asc');

const UNIT_LABELS = {
  kg: 'Kilogramme (kg)',
  unit: 'Unité',
  sac: 'Sac',
  litre: 'Litre',
  piece: 'Pièce',
  botte: 'Botte',
  tas: 'Tas',
};

function unitLabel(unit) {
  return UNIT_LABELS[unit] || unit;
}

const productOptions = computed(() => {
  const source = selectedMarket.value === 'all'
    ? allProducts.value
    : allProducts.value.filter((p) => sameId(p.marketId, selectedMarket.value));

  const names = [...new Set(source.map((p) => p.name))].sort((a, b) => a.localeCompare(b, 'fr'));
  return names;
});

watch(selectedMarket, () => {
  if (selectedProduct.value !== 'all' && !productOptions.value.includes(selectedProduct.value)) {
    selectedProduct.value = 'all';
  }
});

function getMarketName(marketId) {
  return markets.value.find((m) => sameId(m.id, marketId))?.name || '—';
}

function getMarketLocation(marketId) {
  return getAdministrativeLocationLabel(markets.value.find((m) => sameId(m.id, marketId))) || '—';
}

function getMerchantName(merchantId) {
  return merchants.value.find((m) => sameId(m.id, merchantId))?.name || '—';
}

function buildRows(products) {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    marketId: p.marketId,
    marketName: getMarketName(p.marketId),
    location: getMarketLocation(p.marketId),
    unit: p.unit,
    unitLabel: unitLabel(p.unit),
    price: p.price,
    merchantName: getMerchantName(p.merchantId),
    createdAt: p.createdAt || '—',
    available: p.available,
  }));
}

async function applyFilter() {
  loading.value = true;
  hasFiltered.value = true;

  try {
    const params = { per_page: 200, available: true };
    if (selectedMarket.value !== 'all') {
      params.market_id = selectedMarket.value;
    }

    let products = await fetchProducts(params);

    if (selectedProduct.value !== 'all') {
      products = products.filter((p) => p.name === selectedProduct.value);
    }

    filteredRows.value = buildRows(products);
    appliedMarket.value = selectedMarket.value;
    appliedProduct.value = selectedProduct.value;
    keyword.value = '';
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  selectedMarket.value = 'all';
  selectedProduct.value = 'all';
  keyword.value = '';
  appliedMarket.value = 'all';
  appliedProduct.value = 'all';
  filteredRows.value = [];
  hasFiltered.value = false;
  sortKey.value = 'name';
  sortDir.value = 'asc';
}

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = key === 'price' ? 'desc' : 'asc';
  }
}

const displayedRows = computed(() => {
  let rows = [...filteredRows.value];

  if (keyword.value.trim()) {
    const q = keyword.value.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.marketName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.merchantName.toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];

    if (sortKey.value === 'price') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = String(aVal ?? '').toLowerCase();
      bVal = String(bVal ?? '').toLowerCase();
    }

    if (aVal < bVal) return sortDir.value === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir.value === 'asc' ? 1 : -1;
    return 0;
  });

  return rows;
});

const priceStats = computed(() => {
  if (!displayedRows.value.length) return null;
  const prices = displayedRows.value.map((r) => r.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
  };
});

function exportCsv() {
  if (!displayedRows.value.length) return;

  const headers = ['#', 'Produit', 'Catégorie', 'Marché', 'Localisation', 'Unité', 'Prix (BIF)', 'Commerçant', 'Date'];
  const lines = displayedRows.value.map((r, i) => [
    i + 1,
    r.name,
    r.category,
    r.marketName,
    r.location,
    r.unitLabel,
    r.price,
    r.merchantName,
    r.createdAt,
  ]);

  const csv = [headers, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tendances-prix-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const columns = [
  { key: 'name', label: 'Nom du produit' },
  { key: 'category', label: 'Catégorie' },
  { key: 'marketName', label: 'Marché' },
  { key: 'location', label: 'Localisation' },
  { key: 'unitLabel', label: 'Unité' },
  { key: 'price', label: 'Prix (BIF)', highlight: true },
  { key: 'merchantName', label: 'Commerçant' },
  { key: 'createdAt', label: 'Date' },
];
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-foreground tracking-tight">Tendances des prix</h1>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">Sélectionner un marché</label>
          <select
            v-model="selectedMarket"
            class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="all">Tous les marchés</option>
            <option v-for="m in markets" :key="m.id" :value="m.id">
              {{ m.name }} 
            </option>
          </select>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">Sélectionner un produit</label>
          <select
            v-model="selectedProduct"
            class="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="all">Tous les produits</option>
            <option v-for="name in productOptions" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-center pt-1">
        <button
          type="button"
          :disabled="loading || !initialized"
          class="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider px-10 py-2.5 rounded transition-colors shadow-sm"
          @click="applyFilter"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Chargement...
          </span>
          <span v-else>Filtrer</span>
        </button>
      </div>
    </div>

    <!-- Résultats -->
    <div v-if="hasFiltered" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-800">Données des prix</h2>
      </div>

      <!-- Barre d'outils -->
      <div class="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 border border-sky-200 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded transition-colors"
            @click="clearFilters"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Effacer
          </button>
          <button
            type="button"
            :disabled="!displayedRows.length"
            class="flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 border border-violet-200 bg-violet-50 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors"
            @click="exportCsv"
          >
            <Download class="w-3.5 h-3.5" />
            CSV
          </button>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <div class="relative flex-1 sm:w-56">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              v-model="keyword"
              type="text"
              placeholder="Recherche par mot-clé"
              class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <!-- Stats rapides -->
      <div
        v-if="priceStats && displayedRows.length > 1"
        class="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600"
      >
        <span><strong class="text-slate-800">{{ displayedRows.length }}</strong> résultat(s)</span>
        <span>Prix min : <strong class="text-emerald-700">{{ priceStats.min.toLocaleString('fr-FR') }} BIF</strong></span>
        <span>Prix max : <strong class="text-red-600">{{ priceStats.max.toLocaleString('fr-FR') }} BIF</strong></span>
        <span>Moyenne : <strong class="text-slate-800">{{ priceStats.avg.toLocaleString('fr-FR') }} BIF</strong></span>
      </div>

      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wide">
              <th class="px-4 py-3 text-left w-10">#</th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left cursor-pointer hover:bg-slate-200/60 transition-colors select-none whitespace-nowrap"
                :class="col.highlight ? 'bg-sky-100 text-sky-800' : ''"
                @click="toggleSort(col.key)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ col.label }}
                  <ArrowUpDown class="w-3 h-3 opacity-50" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-slate-400 text-sm">
                <Loader2 class="w-5 h-5 animate-spin mx-auto mb-2" />
                Chargement des données...
              </td>
            </tr>
            <tr v-else-if="!displayedRows.length">
              <td :colspan="columns.length + 1" class="px-4 py-12 text-center text-slate-400 text-sm font-medium">
                Aucun résultat trouvé
              </td>
            </tr>
            <tr
              v-for="(row, index) in displayedRows"
              v-else
              :key="row.id"
              class="border-t border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-4 py-3 text-slate-500 text-xs">{{ index + 1 }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ row.name }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ row.category }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ row.marketName }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ row.location }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ row.unitLabel }}</td>
              <td class="px-4 py-3 font-bold text-slate-900 bg-sky-50/50">
                {{ row.price.toLocaleString('fr-FR') }} BIF
              </td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ row.merchantName }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{{ row.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Barre de progression -->
      <div v-if="loading" class="h-1 bg-slate-100 overflow-hidden">
        <div class="h-full bg-primary animate-pulse w-full origin-left" style="animation: progress 1.5s ease-in-out infinite" />
      </div>
    </div>

    <!-- État initial -->
    <div
      v-else
      class="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400"
    >
    </div>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% { transform: scaleX(0.1); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(0.1); }
}
</style>
