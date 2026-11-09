<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import { MapPin, Users, LayoutGrid, ChevronRight } from 'lucide-vue-next';

const { markets, merchants, places } = useApp();
const { goToTab } = usePublicNavigation();
const router = useRouter();

const market = computed(() => markets.value[0] || null);
const merchantCount = computed(() => merchants.value.length);
const occupiedPlaces = computed(() =>
  places.value.filter((place) => place.status === 'occupied').length,
);
const freePlaces = computed(() =>
  places.value.filter((place) => place.status === 'available').length,
);
</script>

<template>
  <div class="space-y-12 pb-20">
    <section v-if="market" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
      <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <div class="relative h-64 w-full overflow-hidden">
          <img
            v-if="market.image"
            :src="market.image"
            :alt="market.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div class="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <p class="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5" />
              {{ getAdministrativeLocationLabel(market) }}
            </p>
            <h1 class="text-3xl font-extrabold">{{ market.name }}</h1>
            <p class="text-sm text-white/80 max-w-2xl">{{ market.description }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          <div>
            <p class="text-[11px] font-semibold uppercase text-slate-400">Commerçants</p>
            <p class="text-2xl font-extrabold">{{ merchantCount }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase text-slate-400">Places occupées</p>
            <p class="text-2xl font-extrabold">{{ occupiedPlaces }}</p>
          </div>
          <div>
            <p class="text-[11px] font-semibold uppercase text-slate-400">Places libres</p>
            <p class="text-2xl font-extrabold text-primary">{{ freePlaces }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="mx-auto max-w-7xl px-4 py-20 text-center text-slate-500">
      Chargement du marché...
    </section>

    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        class="bg-primary text-slate-950 font-bold px-5 py-3 rounded-xl text-sm"
        @click="goToTab('request')"
      >
        Demander une place
        <ChevronRight class="w-4 h-4 inline" />
      </button>
      <button
        type="button"
        class="bg-white border border-slate-200 font-bold px-5 py-3 rounded-xl text-sm"
        @click="goToTab('merchants')"
      >
        <Users class="w-4 h-4 inline mr-1" />
        Voir les commerçants
      </button>
      <button
        type="button"
        class="bg-white border border-slate-200 font-bold px-5 py-3 rounded-xl text-sm"
        @click="router.push('/register')"
      >
        <LayoutGrid class="w-4 h-4 inline mr-1" />
        Créer mon compte
      </button>
    </section>
  </div>
</template>
