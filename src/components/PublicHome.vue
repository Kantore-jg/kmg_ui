<!--
  @license
  SPDX-License-Identifier: Apache-2.0
-->

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import {
  Search,
  MapPin,
  TrendingUp,
  Store,
  Users,
  Package,
  LayoutGrid,
  ChevronRight,
  CheckCircle,
  Sparkles,
} from 'lucide-vue-next';

const {
  markets,
  products,
  merchants,
} = useApp();

const { goToTab, goToMarket, goToProduct } = usePublicNavigation();

const searchQuery = ref('');
const searchCategory = ref('all');
const searchMarket = ref('all');

const totalMarketsCount = computed(() => markets.value.length);
const totalMerchantsCount = computed(() => merchants.value.length);
const totalProductsCount = computed(() => products.value.length);
const totalAvailablePlaces = computed(() =>
  markets.value.reduce((sum, m) => sum + (m.totalPlaces - m.occupiedPlaces), 0)
);

function handleHeroSearchSubmit(e) {
  e.preventDefault();
  goToTab('products');
}
</script>

<template>
  <div class="space-y-16 pb-20">


    <!-- 2. CATEGORIES INSPIRATION BAR
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
           <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Filières Actives</h3> 
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">Explorer par Catégories</h2>
        </div>
        <button
          @click="goToTab('products')"
          class="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 self-start"
        >
          Tous les produits
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="(cat, idx) in categories"
          :key="idx"
          @click="goToTab('products')"
          class="bg-white hover:bg-primary/5/40 p-4 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all cursor-pointer shadow-sm flex flex-col items-center text-center group"
        >
          <span class="text-3xl mb-2.5 group-hover:scale-110 transition-transform duration-200">{{ cat.icon }}</span>
          <h5 class="text-xs sm:text-sm font-bold text-slate-800">{{ cat.name }}</h5>
          <p class="text-[11px] text-slate-400 mt-1 font-medium">{{ cat.count }} articles en vente</p>
        </div>
      </div>
    </section> -->

    <!-- 3. POPULAR MARKETS SECTION -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <!-- <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Infrastructures du Pays</h3> -->
          <h2 >Nos Marchés Publics Connectés</h2>
        </div>
        <button
          @click="goToTab('markets')"
          class="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 self-start"
        >
          Afficher la liste complète
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="m in markets"
          :key="m.id"
          class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col group"
        >
          <div class="relative h-44 w-full overflow-hidden">
            <img
              :src="m.image"
              :alt="m.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <!-- <div class="absolute top-3 left-3 bg-slate-900/80 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <MapPin class="w-3 h-3 text-primary" />
              {{ getAdministrativeLocationLabel(m) }}
            </div> -->
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <h4 class="text-sm sm:text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                {{ m.name }}
              </h4>
              <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {{ getAdministrativeLocationLabel(m) }}
              </p>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {{ m.description }}
              </p>
            </div>

            <div class="space-y-3 pt-2">
              <div class="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 border-t border-slate-100 pt-3">
                <div>
                  <span class="text-slate-400 block text-[10px]">CO-LOCATAIRES :</span>
                  <span class="text-slate-900 text-xs font-bold">{{ m.occupiedPlaces }} actifs</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">PLACES LIBRES :</span>
                  <span
                    class="text-xs font-bold"
                    :class="(m.totalPlaces - m.occupiedPlaces) > 0 ? 'text-primary' : 'text-amber-600'"
                  >
                    {{ m.totalPlaces - m.occupiedPlaces }} dispos
                  </span>
                </div>
              </div>

              <button
                @click="goToMarket(m.id)"
                class="w-full bg-background hover:bg-primary/5 hover:text-primary text-slate-700 font-bold transition-all py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-100"
              >
                Visiter le Marché
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. STATISTICS PANEL -->
    <section class="bg-slate-100/70 border-y border-slate-200/50 py-12 px-4">
      <div class="mx-auto max-w-7xl">
        <div class="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <!-- <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Indicateurs Digitaux</h3> -->
          <h2>Akaguriro en Chiffres</h2>
          <!-- <p class="text-slate-500 text-xs sm:text-sm">
            Suivi statistique réactif de nos places d'étalage et flux de produits nationaux.
          </p> -->
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div class="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Store class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 block font-semibold uppercase">Marchés Digitalisés</span>
              <span class="text-2xl font-extrabold text-slate-900">{{ totalMarketsCount }}</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 block font-semibold uppercase">Commerçants Enregistrés</span>
              <span class="text-2xl font-extrabold text-slate-900">{{ totalMerchantsCount }}</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Package class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 block font-semibold uppercase">Produits en Ligne</span>
              <span class="text-2xl font-extrabold text-slate-900">{{ totalProductsCount }}</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200/40 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <LayoutGrid class="w-6 h-6" />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 block font-semibold uppercase">Emplacements Libres</span>
              <span class="text-2xl font-extrabold text-slate-900 text-primary">{{ totalAvailablePlaces }}</span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 5. TRENDING PRODUCTS SECTION -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <!-- <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Catalogue National</h3> -->
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Produits Tendances</h2>
        </div>
        <button
          @click="goToTab('products')"
          class="text-xs font-bold text-primary hover:text-primary flex items-center gap-1.5 self-start"
        >
          Explorer tout le catalogue
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          v-for="p in products.slice(0, 4)"
          :key="p.id"
          @click="goToProduct(p.id)"
          class=""
        >
          <div class="relative rounded-xl overflow-hidden bg-background aspect-square">
            <img
              :src="p.image"
              :alt="p.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span
              v-if="p.isTrending"
              class="absolute top-2.5 left-2.5 bg-yellow-400 text-slate-900 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm"
            >
              <TrendingUp class="w-3 h-3" />
              Tendance
            </span>
            <span
              v-if="p.stock <= 5"
              class="absolute bottom-2.5 right-2.5 bg-red-100 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded border border-red-200"
            >
              Stock Faible
            </span>
          </div>

            <div class="space-y-1">
              <span class="text-[10px] font-bold text-primary uppercase tracking-wide">
                {{ p.category }}
              </span>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
              {{ p.name }}
            </h4>
            <p class="text-[11px] text-slate-400 font-medium">
              {{ getAdministrativeLocationLabel(markets.find(m => m.id === p.marketId)) }} • Étale {{ p.placeNumber }}
            </p>
          </div>

          <div class="border-t border-slate-50 pt-2.5 flex items-center justify-between">
            <div>
              <span class="text-xs sm:text-sm font-extrabold text-primary">
                {{ p.price.toLocaleString('fr-FR') }} BIF
              </span>
              <span class="text-[9.5px] text-slate-400 ml-1">/ {{ p.unit }}</span>
            </div>
            <span class="text-[10px] font-bold bg-background text-slate-600 px-2 py-1 rounded-lg hover:bg-primary group-hover:bg-primary group-hover:text-white transition-colors">
              Détails
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. PROMOTIONAL SUB-HERO FOR MERCHANTS -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- <div class="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"> -->
        
        <div class="shrink-0 flex flex-col sm:flex-row gap-3 relative w-full sm:w-auto">
          <button
            @click="goToTab('request')"
            class="bg-primary hover:bg-emerald-400 transition-all text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md text-center"
          >
            Demander une place
          </button>
          <button
            @click="router.push('/register')"
            class="bg-primary hover:bg-emerald-400 transition-all text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md text-center"
          >
            Créer mon compte
          </button>
        </div>
      <!-- </div> -->
    </section>

  </div>
</template>
