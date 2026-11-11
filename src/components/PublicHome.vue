<script setup>
import { computed, ref, watch } from 'vue';
import {
  MapPin,
  LayoutGrid,
  Grid3X3,
  CircleCheck,
  Clock3,
  CalendarDays,
  Store,
  ChevronRight,
  Utensils,
  Shirt,
  Fish,
  ShoppingBasket,
} from 'lucide-vue-next';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { sameId } from '../utils/ids.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import { PLACE_STATUS } from '../utils/placeStatus.js';

const { markets, places, blocks } = useApp();
const { goToTab } = usePublicNavigation();

const selectedMarketId = ref(null);

watch(
  markets,
  (items) => {
    if (!items.length) {
      selectedMarketId.value = null;
      return;
    }
    if (!selectedMarketId.value || !items.some((m) => sameId(m.id, selectedMarketId.value))) {
      selectedMarketId.value = items[0].id;
    }
  },
  { immediate: true },
);

const market = computed(() =>
  markets.value.find((m) => sameId(m.id, selectedMarketId.value)) || markets.value[0] || null,
);

const marketPlaces = computed(() =>
  places.value.filter((p) => sameId(p.marketId, market.value?.id)),
);

const marketBlocks = computed(() =>
  blocks.value.filter((b) => sameId(b.marketId, market.value?.id)),
);

const blockStats = computed(() =>
  marketBlocks.value.map((block, index) => {
    const blockPlaces = marketPlaces.value.filter((p) => sameId(p.blockId, block.id));
    const total = blockPlaces.length || Number(block.totalPlaces || block.placesCount || 0);
    const available = blockPlaces.filter((p) => p.status === PLACE_STATUS.AVAILABLE).length;
    return {
      ...block,
      totalPlaces: total,
      availablePlaces: available,
      activity: block.description || inferActivity(block.name) || 'Commerce général',
      tone: BLOCK_TONES[index % BLOCK_TONES.length],
      icon: pickBlockIcon(block.name, block.description),
    };
  }),
);

const blocksCount = computed(() => marketBlocks.value.length);
const totalPlaces = computed(() =>
  marketPlaces.value.length || Number(market.value?.totalPlaces || 0),
);
const availablePlaces = computed(() => {
  const fromPlaces = marketPlaces.value.filter((p) => p.status === PLACE_STATUS.AVAILABLE).length;
  if (marketPlaces.value.length) return fromPlaces;
  return Number(market.value?.availablePlaces || 0);
});

const locationLabel = computed(() => {
  if (!market.value) return '';
  const commune = market.value.commune || '';
  const province = market.value.province || '';
  if (commune && province) return `${titleCase(commune)}, Province de ${titleCase(province)}`;
  return getAdministrativeLocationLabel(market.value) || market.value.location || '—';
});

const addressLabel = computed(() => {
  if (!market.value) return '—';
  return market.value.location
    || [market.value.colline, market.value.zone, market.value.commune]
      .filter(Boolean)
      .map(titleCase)
      .join(', ')
    || locationLabel.value;
});

const activityTypes = computed(() => {
  const fromPlaces = [...new Set(
    marketPlaces.value.map((p) => p.category).filter(Boolean),
  )];
  if (fromPlaces.length) return fromPlaces.slice(0, 3).join(', ');
  return 'Commerce général';
});

const BLOCK_TONES = [
  { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
];

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferActivity(name = '') {
  const key = name.toLowerCase();
  if (key.includes('aliment') || key.includes('vivre')) return 'Produits alimentaires';
  if (key.includes('textile') || key.includes('habit')) return 'Textiles & vêtements';
  if (key.includes('poisson')) return 'Poissonnerie';
  if (key.includes('fruit') || key.includes('légume')) return 'Fruits & légumes';
  return '';
}

function pickBlockIcon(name = '', description = '') {
  const key = `${name} ${description}`.toLowerCase();
  if (key.includes('textile') || key.includes('habit')) return Shirt;
  if (key.includes('poisson')) return Fish;
  if (key.includes('fruit') || key.includes('légume') || key.includes('aliment')) return Utensils;
  return ShoppingBasket;
}

function openRequest() {
  goToTab('request');
}

function formatCount(value) {
  return Number(value || 0).toLocaleString('fr-FR');
}
</script>

<template>
  <div class="bg-slate-100/80 min-h-full">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div v-if="markets.length > 1" class="flex justify-end">
        <select
          v-model="selectedMarketId"
          class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
        >
          <option v-for="item in markets" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>

      <section v-if="market" class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div class="lg:col-span-5">
            <div class="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
              <img
                v-if="market.image || market.coverImage"
                :src="market.image || market.coverImage"
                :alt="market.name"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center text-slate-400">
                <Store class="h-12 w-12" />
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 flex flex-col justify-center space-y-4">
            <div class="space-y-2">
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#0b3a7a]">
                {{ market.name }}
              </h1>
              <p class="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin class="h-4 w-4 text-[#0b3a7a] shrink-0" />
                {{ locationLabel }}
              </p>
              <p class="text-sm leading-relaxed text-slate-600 max-w-2xl">
                {{ market.description || 'Marché public structuré pour l’accueil des commerçants et la gestion des emplacements.' }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div class="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <LayoutGrid class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-800 leading-none">{{ formatCount(blocksCount) }}</p>
                  <p class="text-xs text-slate-500 mt-1">Blocs</p>
                </div>
              </div>

              <div class="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b3a7a]/10 text-[#0b3a7a]">
                  <Grid3X3 class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-800 leading-none">{{ formatCount(totalPlaces) }}</p>
                  <p class="text-xs text-slate-500 mt-1">Places</p>
                </div>
              </div>

              <div class="rounded-xl bg-emerald-50/70 border border-emerald-100 px-4 py-3 flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CircleCheck class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-lg font-bold text-emerald-700 leading-none">{{ formatCount(availablePlaces) }}</p>
                  <p class="text-xs text-slate-500 mt-1">Disponibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
        Chargement du marché...
      </section>

      <section v-if="market" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div class="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="bg-[#0b3a7a] px-5 py-3.5">
            <h2 class="text-sm font-semibold text-white">Informations générales</h2>
          </div>
          <div class="divide-y divide-slate-100">
            <div class="flex items-start gap-3 px-5 py-4">
              <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                <Clock3 class="h-4 w-4" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Horaires</p>
                <p class="text-sm font-medium text-slate-800 mt-0.5">06h00 - 18h00</p>
              </div>
            </div>
            <div class="flex items-start gap-3 px-5 py-4">
              <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <CalendarDays class="h-4 w-4" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jours d’ouverture</p>
                <p class="text-sm font-medium text-slate-800 mt-0.5">Tous les jours</p>
              </div>
            </div>
            <div class="flex items-start gap-3 px-5 py-4">
              <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Store class="h-4 w-4" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Types d’activités</p>
                <p class="text-sm font-medium text-slate-800 mt-0.5">{{ activityTypes }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3 px-5 py-4">
              <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <MapPin class="h-4 w-4" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Adresse</p>
                <p class="text-sm font-medium text-slate-800 mt-0.5">{{ addressLabel }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-800">Blocs du marché</h2>
            <button
              type="button"
              class="text-xs font-semibold text-[#0b3a7a] hover:underline inline-flex items-center gap-1"
              @click="openRequest"
            >
              Voir le plan complet
              <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </div>

          <div v-if="!blockStats.length" class="px-5 py-10 text-center text-sm text-slate-400">
            Aucun bloc configuré pour ce marché.
          </div>

          <div v-else class="divide-y divide-slate-100">
            <button
              v-for="block in blockStats"
              :key="block.id"
              type="button"
              class="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
              @click="openRequest"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                :class="[block.tone.bg, block.tone.text, block.tone.border]"
              >
                <component :is="block.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ block.name }}</p>
                <p class="text-xs text-slate-500 truncate">{{ block.activity }}</p>
                <p class="text-xs text-slate-600 mt-1">
                  {{ formatCount(block.totalPlaces) }} places
                  <span class="font-semibold text-emerald-600">
                    ({{ formatCount(block.availablePlaces) }} disponibles)
                  </span>
                </p>
              </div>
              <ChevronRight class="h-4 w-4 text-slate-300 shrink-0" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
