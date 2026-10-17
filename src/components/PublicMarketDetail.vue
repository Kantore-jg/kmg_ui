<!--
  @license
  SPDX-License-Identifier: Apache-2.0
-->

<script setup>
import { ref, computed } from 'vue';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { categoriesForMarket, placeHasCategory } from '../utils/categories.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import { sameId } from '../utils/ids.js';
import {
  PLACE_STATUS,
  isPlaceAvailable,
  isPlaceOccupied,
  placeStatusLabel,
} from '../utils/placeStatus.js';
import {
  MapPin,
  Store,
  ShieldCheck,
  Search,
  X,
  MessageSquare,
  Phone,
  Compass,
  ArrowLeft,
} from 'lucide-vue-next';

const {
  markets,
  places,
  merchants,
  products,
  selectedMarketId,
  initialized,
} = useApp();

const { goToMarketsList, goToProduct, goToTab } = usePublicNavigation();

const mapCategoryHighlight = ref('all');
const selectedPlace = ref(null);
const productSearch = ref('');
const productCat = ref('all');

const market = computed(() =>
  markets.value.find((m) => sameId(m.id, selectedMarketId.value)),
);

const marketPlaces = computed(() => {
  if (!market.value) return [];
  return places.value.filter((p) => sameId(p.marketId, market.value.id));
});

const blocks = computed(() => {
  const seen = new Set();
  return marketPlaces.value
    .filter((place) => place.block?.id || place.blockName)
    .map((place) => place.block || {
      id: place.blockId || place.blockName,
      name: place.blockName,
      code: '',
      rentAmount: 0,
    })
    .filter((block) => {
      const key = String(block.id ?? block.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
});

const marketProducts = computed(() => {
  if (!market.value) return [];
  return products.value.filter(p => {
    const isThisMarket = sameId(p.marketId, market.value.id);
    const matchesSearch = p.name.toLowerCase().includes(productSearch.value.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.value.toLowerCase());
    const matchesCat = productCat.value === 'all' || p.category === productCat.value;
    return isThisMarket && matchesSearch && matchesCat;
  });
});

const marketMerchants = computed(() => {
  if (!market.value) return [];
  return merchants.value.filter((m) => sameId(m.activeMarketId, market.value.id));
});

const topMerchants = computed(() =>
  [...marketMerchants.value]
    .sort((a, b) => (b.productsCount ?? 0) - (a.productsCount ?? 0))
    .slice(0, 3),
);

const activeStallMerchant = computed(() => {
  if (!selectedPlace.value || !selectedPlace.value.merchantId) return null;
  return merchants.value.find((m) => sameId(m.id, selectedPlace.value.merchantId)) || null;
});

const activeStallMerchantProducts = computed(() => {
  if (!selectedPlace.value || !selectedPlace.value.merchantId) return [];
  return products.value.filter((p) => sameId(p.merchantId, selectedPlace.value.merchantId));
});

const marketCategoryOptions = computed(() => categoriesForMarket(market.value));

function handlePlaceClick(place) {
  selectedPlace.value = place;
}

function currentStallAvailabilityColor(status) {
  if (isPlaceOccupied(status)) return 'bg-primary border-emerald-700 text-white';
  if (isPlaceAvailable(status)) return 'bg-white border-dashed border-slate-300 text-slate-400 hover:bg-primary/5 hover:border-primary/30';
  if (status === PLACE_STATUS.MAINTENANCE) return 'bg-amber-100 border-amber-300 text-amber-700';
  return 'bg-slate-100 border-slate-200';
}

function getStallOccupantName(p) {
  if (!isPlaceOccupied(p.status)) return placeStatusLabel(p.status).toUpperCase();
  const vendor = merchants.value.find((m) => sameId(m.id, p.merchantId));
  return vendor ? vendor.name : 'Occupé';
}

function getBlockPlaces(block) {
  return marketPlaces.value.filter((p) => {
    const blockId = p.block?.id ?? p.blockId ?? p.blockName;
    const candidateId = block?.id ?? block?.name;
    return String(blockId) === String(candidateId);
  });
}

function formatRent(amount) {
  return `${Number(amount || 0).toLocaleString('fr-FR')} BIF`;
}

function getVendor(merchantId) {
  return merchants.value.find((m) => sameId(m.id, merchantId));
}
</script>

<template>
  <div v-if="!initialized" class="py-20 text-center text-slate-500 text-sm">
    <p>Chargement du marché...</p>
  </div>

  <div v-else-if="!market" class="py-12 text-center text-slate-500">
    <p>Marché introuvable.</p>
    <button @click="goToMarketsList" class="text-primary font-bold text-xs mt-2">
      Retour à la liste
    </button>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-12 relative">

    <!-- 1. RETRO-NAVIGATION BAR -->
    <div class="flex items-center justify-between">
      <button
        @click="goToMarketsList"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
      >
        <ArrowLeft class="w-4 h-4" />
        Retour aux marchés publics
      </button>
      <!-- <span class="text-xs font-semibold text-slate-400 bg-background px-2.5 py-1 rounded-full">
        Système ID: {{ String(market.id).toUpperCase() }} • {{ getAdministrativeLocationLabel(market) }}
      </span> -->
    </div>

    <!-- 2. COVER HEADER -->
    <section class="relative overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-slate-950 text-white p-6 sm:p-10">
      <div class="absolute inset-0 z-0 opacity-40">
        <img
          :src="market.coverImage"
          :alt="market.name"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40"></div>
      </div>

      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

        <div class="lg:col-span-8 space-y-4">
          <!-- <span class="inline-block bg-primary/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            En direct de {{ getAdministrativeLocationLabel(market) }}
          </span> -->
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {{ market.name }}
          </h1>
          <p class="text-slate-200 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
            {{ market.description }}
          </p>
          <p class="text-slate-400 text-xs font-semibold flex items-center gap-1">
            <MapPin class="w-4 h-4 text-primary shrink-0" />
            {{ getAdministrativeLocationLabel(market) || market.location }}
          </p>
        </div>

        <div class="lg:col-span-4 grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-sm">
          <div class="text-center p-2">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Places</span>
            <span class="text-lg font-black text-primary">{{ market.totalPlaces }}</span>
          </div>
          <div class="text-center p-2 border-x border-slate-800">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Occupées</span>
            <span class="text-lg font-black text-white">{{ market.occupiedPlaces }}</span>
          </div>
          <div class="text-center p-2">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Libres</span>
            <span class="text-lg font-black text-teal-400">{{ market.totalPlaces - market.occupiedPlaces }}</span>
          </div>
        </div>

      </div>
    </section>

    <!-- 3. CARTE INTERACTIVE INTERNE (Maps Indoor-Style) -->
    <section class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div class="space-y-1">
          
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400">Surligner la catégorie :</span>
          <select
            v-model="mapCategoryHighlight"
            class="bg-background border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer text-slate-700"
          >
            <option value="all">Toutes les catégories</option>
            <option v-for="cat in marketCategoryOptions" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-6 py-2 px-4 bg-background rounded-xl text-xs font-semibold text-slate-600">
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-md bg-primary"></span>
          <span>Occupée / Active</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-md border border-dashed border-slate-300 bg-white"></span>
          <span>Libre / Disponible</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-md bg-amber-100 border border-amber-200"></span>
          <span>En maintenance / Réservée</span>
        </div>
        <div class="flex items-center gap-2 text-slate-400 border-l border-slate-200 pl-4">
          <span class="inline-block w-3.5 h-3.5 rounded border border-emerald-400 border-2 animate-pulse bg-emerald-50"></span>
          <span>Surligné / Filtre Actif</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div class="lg:col-span-8 space-y-8 bg-background p-4 sm:p-6 rounded-2xl border border-slate-100 relative">
          <div class="absolute top-2 right-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded select-none">
            Entrée Principale (Nord)
          </div>

          <div
            v-for="block in blocks"
            :key="block.id"
            class="space-y-3.5 bg-white p-4 rounded-xl border border-slate-200/40 shadow-sm"
          >
            <div class="flex justify-between items-center bg-background px-2.5 py-1.5 rounded-lg border border-slate-100">
              <h4 class="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Store class="w-4 h-4 text-primary" />
                {{ block.name }}
              </h4>
              <span class="text-[10px] font-bold text-slate-400 text-right">
                {{ getBlockPlaces(block).filter(p => p.status === PLACE_STATUS.AVAILABLE).length }} places vacantes
              </span>
            </div>

            <div class="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Loyer du bloc</span>
              <span class="text-xs font-black text-emerald-700">
                {{ formatRent(block.rentAmount) }} / place
              </span>
            </div>

            <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 pt-1">
              <div
                v-for="pl in getBlockPlaces(block)"
                :key="pl.id"
                @click="handlePlaceClick(pl)"
                class="cursor-pointer rounded-xl border p-2.5 transition-all flex flex-col justify-between h-20 shadow-sm relative group select-none"
                :class="[
                  currentStallAvailabilityColor(pl.status),
                  (mapCategoryHighlight !== 'all' && placeHasCategory(pl, mapCategoryHighlight) && pl.status === PLACE_STATUS.OCCUPIED)
                    ? 'ring-2 ring-emerald-500 ring-offset-2 scale-102 border-emerald-500 bg-emerald-50/25 animate-pulseGlow'
                    : ''
                ]"
              >
                <div class="flex justify-between items-center">
                  <span class="text-xs font-extrabold tracking-tight">
                    {{ pl.id }}
                  </span>
                  <span v-if="pl.status === PLACE_STATUS.OCCUPIED" class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                </div>

                <div class="mt-1">
                  <p class="text-[10px] font-bold truncate tracking-tight leading-none">
                    {{ getStallOccupantName(pl).split(' ')[0] }}
                  </p>
                  <p class="text-[9px] text-slate-400 dark:text-slate-300 font-semibold truncate leading-none mt-1">
                    {{ pl.categories?.length ? pl.categories.join(', ') : (pl.status === PLACE_STATUS.AVAILABLE ? 'Vacant' : '—') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-200/50 py-1.5 px-3 rounded select-none">
            Portail de Sécurité (Midi)
          </div>
        </div>

        <div class="lg:col-span-4 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-5 shadow-lg relative min-h-[300px] flex flex-col justify-between">
          <template v-if="selectedPlace">
              <div class="space-y-5">
                <div class="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h4 class="text-base font-extrabold text-white">Étalage local {{ selectedPlace.id }}</h4>
                  <p class="text-[10px] text-primary font-bold uppercase tracking-wider">{{ selectedPlace.blockName }} • {{ selectedPlace.rowName }}</p>
                  </div>
                <button
                  @click="selectedPlace = null"
                  class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X class="w-4.5 h-4.5" />
                </button>
              </div>

              <div v-if="selectedPlace.status === PLACE_STATUS.AVAILABLE" class="space-y-4 py-3">
                <div class="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">
                   Emplacement Libre
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-semibold">
                  Cette place est actuellement vacante de commerçant. Elle peut accueillir des activités de type <strong class="text-white">Commerce Général, Primeurs, Poissonnerie ou textiles</strong>.
                </p>
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span class="block text-[10px] text-slate-400 font-bold">LOYER DU BLOC :</span>
                  <strong class="text-xs text-primary font-black">
                    {{ formatRent(selectedPlace.block?.rentAmount) }} / place
                  </strong>
                </div>
                <button
                  @click="goToTab('request')"
                  class="w-full bg-primary hover:bg-emerald-400 text-slate-950 transition-all font-bold py-2 rounded-xl text-xs text-center"
                >
                  Introduire une demande d'octroi
                </button>
              </div>

              <div v-else-if="selectedPlace.status === PLACE_STATUS.MAINTENANCE" class="space-y-4 py-3">
                <div class="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20">
                   En travaux / Réservée
                </div>
                <p class="text-xs text-slate-300 leading-relaxed font-semibold">
                  Cet emplacement fait l'objet d'opérations d'entretien périodiques ou d'ajustement structurels par l'équipe d'administration publique.
                </p>
              </div>

              <div v-else class="space-y-5">
                <template v-if="activeStallMerchant">
                  <div class="space-y-4">
                    <div class="flex gap-3 items-center bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <img
                        :src="activeStallMerchant.image"
                        :alt="activeStallMerchant.name"
                        class="w-12 h-12 rounded-lg object-cover bg-slate-800"
                      />
                      <div class="flex-1 min-w-0">
                        <h5 class="text-xs font-black text-white truncate flex items-center gap-1 justify-between">
                          {{ activeStallMerchant.name }}
                          <ShieldCheck class="w-3.5 h-3.5 text-primary inline shrink-0" />
                        </h5>
                        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{{ activeStallMerchant.category }}</p>
                      </div>
                    </div>

                    <p class="text-[11px] text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      "{{ activeStallMerchant.bio || 'pas de description.' }}"
                    </p>

                    <div class="space-y-2">
                      <span class="block text-[10px] text-slate-400 font-bold uppercase">Produits en vente à la place {{ selectedPlace.id }} :</span>
                      <p v-if="activeStallMerchantProducts.length === 0" class="text-[11px] text-slate-500">Aucun produit listé.</p>
                      <div v-else class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        <div
                          v-for="p in activeStallMerchantProducts"
                          :key="p.id"
                          @click="goToProduct(p.id)"
                          class="flex items-center justify-between p-1.5 bg-slate-950 hover:bg-slate-850 rounded border border-slate-850 text-xs cursor-pointer group"
                        >
                          <div class="flex items-center gap-2">
                            <img :src="p.image" :alt="p.name" class="w-7 h-7 rounded object-cover" />
                            <span class="font-semibold text-slate-300 truncate max-w-[120px] group-hover:text-emerald-300">{{ p.name }}</span>
                          </div>
                          <span class="font-extrabold text-primary text-[11px]">{{ p.price.toLocaleString('fr-FR') }} BIF</span>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs pt-2">
                      <a
                        :href="`tel:${activeStallMerchant.phone}`"
                        class="bg-slate-800 text-slate-200 hover:text-white py-1.5 rounded-xl border border-slate-700 font-bold flex items-center justify-center gap-1.5"
                      >
                        <Phone class="w-3.5 h-3.5 text-primary" />
                        Appeler
                      </a>
                      <a
                        :href="`https://wa.me/${(activeStallMerchant.phone || '').replace(/\s+/g, '')}`"
                        target="_blank"
                        rel="noreferrer"
                        class="bg-primary hover:bg-primary text-white py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare class="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </template>
                <p v-else class="text-xs text-slate-300">Aucun détail supplémentaire.</p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div class="w-12 h-12 rounded-xl bg-slate-850 flex items-center justify-center text-slate-400">
                <Compass class="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Aide de Navigation Indoor</h4>
                <p class="text-[11.5px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Cliquez sur l'un des carrés numérotés du plan à gauche pour inspecter son affectation administrative et son inventaire d'articles.
                </p>
              </div>
            </div>
          </template>

          <!-- <div class="border-t border-slate-800 pt-3 text-[9.5px] text-slate-400 font-bold flex justify-between items-center bg-slate-900 select-none">
            <span>GPS: {{ (market.province || 'BURUNDI').toUpperCase() }}_PLAN_LIVE</span>
            <span class="text-primary flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              STABLE OMNI
            </span>
          </div> -->
        </div>

      </div>

    </section>

    <!-- 4. COMMERÇANTS ACTIFS -->
    <section class="space-y-6">
      <div class="border-b border-slate-100 pb-3">
        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
          Commerçants actifs
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <template v-if="topMerchants.length === 0">
          <div class="sm:col-span-3 text-center text-slate-400 text-xs py-10">
            Aucun marchand enregistré pour ce marché.
          </div>
        </template>
        <template v-else>
          <div
            v-for="(m, rank) in topMerchants"
            :key="m.id"
            class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative group"
          >
          <div class="absolute top-2.5 right-2.5 bg-yellow-400 text-slate-950 font-black text-[9.5px] px-2 py-0.5 rounded shadow-sm select-none">
            Rang #{{ rank + 1 }}
          </div>

          <img
            :src="m.image"
            :alt="m.name"
            class="w-14 h-14 rounded-xl object-cover bg-slate-100 shadow-sm select-none shrink-0"
          />

          <div class="space-y-1 min-w-0 flex-1">
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-800 truncate group-hover:text-primary transition-colors">
              {{ m.name }}
            </h4>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ m.category }}</p>
            <p class="text-[11px] text-slate-500 font-medium">Stalle active : <span class="font-bold text-slate-800">{{ m.activePlaceNumber || m.activePlaceId }}</span></p>
            <p class="text-[11px] text-slate-500 font-medium">{{ m.productsCount ?? 0 }} produit(s) référencé(s)</p>
          </div>
          </div>
        </template>
      </div>
    </section>

    <!-- 5. SEARCH & E-COMMERCE PRODUCTS OF THE MARKET -->
    <section class="space-y-6">

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Produits du Marché
          </h2>
        </div>

        <div class="flex flex-wrap gap-2">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
            <Search class="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer par nom..."
              v-model="productSearch"
              class="bg-transparent border-none outline-none text-xs w-32"
            />
          </div>

          <select
            v-model="productCat"
            class="bg-white border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">Filière / Tout</option>
            <option v-for="cat in marketCategoryOptions" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="marketProducts.length === 0" class="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm font-medium">
        Aucun article en ligne correspondant à ces filtres pour le moment.
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="p in marketProducts"
          :key="p.id"
          @click="goToProduct(p.id)"
          class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-3.5 space-y-3 group"
        >
          <div class="relative rounded-xl overflow-hidden bg-background aspect-square">
            <img
              :src="p.image"
              :alt="p.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span
              v-if="p.isTrending"
              class="absolute top-2 left-2 bg-yellow-400 text-slate-900 font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm"
            >
              Élite
            </span>
          </div>

          <div class="space-y-1">
            <span class="text-[9.5px] font-bold text-primary uppercase tracking-wide">
              {{ p.category }}
            </span>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
              {{ p.name }}
            </h4>
            <p class="text-[10.5px] text-slate-400 font-semibold truncate">
              Vendeur : {{ getVendor(p.merchantId) ? getVendor(p.merchantId).name : '—' }} (Ét. {{ p.placeNumber }})
            </p>
          </div>

          <div class="border-t border-slate-50 pt-2 flex items-center justify-between">
            <div>
              <span class="text-xs font-black text-slate-900">
                {{ p.price.toLocaleString('fr-FR') }} BIF
              </span>
              <span class="text-[9px] text-slate-400 ml-1">/ {{ p.unit }}</span>
            </div>
            <span class="text-[10px] font-black text-primary group-hover:text-primary">
              Voir
            </span>
          </div>
        </div>
      </div>

    </section>

  </div>
</template>
