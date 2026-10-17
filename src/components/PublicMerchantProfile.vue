<script setup>
import { computed, ref } from 'vue';
import { ArrowLeft, MessageCircle, Phone, Sparkles } from 'lucide-vue-next';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { sameId } from '../utils/ids.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import PublicProductCard from './PublicProductCard.vue';

const { merchants, markets, products, selectedMerchantId, showToast } = useApp();
const { goToMerchantsList, goToProduct } = usePublicNavigation();

const searchQuery = ref('');
const categoryFilter = ref('all');

const merchant = computed(() =>
  merchants.value.find((item) => sameId(item.id, selectedMerchantId.value)),
);

const merchantMarket = computed(() => {
  if (!merchant.value) return null;
  return markets.value.find((market) => sameId(market.id, merchant.value.activeMarketId))
    || markets.value.find((market) => sameId(market.id, merchant.value.marketId))
    || null;
});

const merchantProducts = computed(() => {
  if (!merchant.value) return [];

  const items = products.value.filter((product) =>
    sameId(product.merchantId, merchant.value.id)
    || (merchant.value.activePlaceId && sameId(product.placeId, merchant.value.activePlaceId)),
  );

  return [...items].sort((a, b) => {
    const aPinned = sameId(a.placeId, merchant.value.activePlaceId);
    const bPinned = sameId(b.placeId, merchant.value.activePlaceId);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return a.name.localeCompare(b.name, 'fr');
  });
});

const categories = computed(() => {
  const set = new Set(merchantProducts.value.map((product) => product.category).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
});

const filteredProducts = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return merchantProducts.value.filter((product) => {
    const matchesQuery =
      !query
      || product.name.toLowerCase().includes(query)
      || product.category.toLowerCase().includes(query);
    const matchesCategory = categoryFilter.value === 'all' || product.category === categoryFilter.value;
    return matchesQuery && matchesCategory;
  });
});

const featuredProducts = computed(() => filteredProducts.value.slice(0, 4));

const backLabel = computed(() =>
  merchantMarket.value ? getAdministrativeLocationLabel(merchantMarket.value) : 'Marché public',
);

function contactWhatsapp() {
  if (!merchant.value?.phone) {
    showToast('Ce commerçant n\'a pas de numéro disponible.', 'info');
    return;
  }

  const phone = String(merchant.value.phone).replace(/\s+/g, '');
  window.open(`https://wa.me/${phone}`, '_blank', 'noreferrer');
}
</script>

<template>
  <div v-if="!merchant" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
    <p class="text-slate-500">Commerçant introuvable.</p>
    <button
      @click="goToMerchantsList"
      class="text-primary font-bold text-xs"
    >
      Retour à la liste des commerçants
    </button>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
    <button
      @click="goToMerchantsList"
      class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
    >
      <ArrowLeft class="w-4 h-4" />
      Retour aux commerçants
    </button>

    
    <section class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Produits de {{ merchant.name }}
          </h2>
          <p class="text-sm text-slate-500">
            Les produits visibles ci-dessous proviennent de son étal ou de son affectation.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary/40"
          />
          <select
            v-model="categoryFilter"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-primary/40"
          >
            <option value="all">Toutes les catégories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="!filteredProducts.length" class="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Aucun produit ne correspond à votre recherche.
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <PublicProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :market-name="merchantMarket?.name || '—'"
          :on-select-product="goToProduct"
        />
      </div>
    </section>
  </div>
</template>
