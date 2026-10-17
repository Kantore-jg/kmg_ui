<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { sameId } from '../utils/ids.js';
import Navigation from './Navigation.vue';
import PublicHome from './PublicHome.vue';
import PublicMarketsList from './PublicMarketsList.vue';
import PublicMarketDetail from './PublicMarketDetail.vue';
import PublicProductDetails from './PublicProductDetails.vue';
import PublicRequestPlace from './PublicRequestPlace.vue';
import PublicPriceTrends from './PublicPriceTrends.vue';
import PublicProductsSection from './PublicProductsSection.vue';
import PublicMerchantsSection from './PublicMerchantsSection.vue';
import PublicMerchantProfile from './PublicMerchantProfile.vue';
import PublicFooter from './PublicFooter.vue';
import ProfilePage from './ProfilePage.vue';

const route = useRoute();
const {
  publicTab,
  setPublicTab,
  selectedMarketId,
  selectedProductId,
  selectedMerchantId,
  setSelectedProductId,
  setSelectedMarketId,
  setSelectedMerchantId,
  products,
  markets,
  merchants,
  productCategories,
  toast,
  initialized,
  ensurePublicSupplementalData,
} = useApp();

const { goToProduct, goToMerchant, goToTab, goHome } = usePublicNavigation();

const tabFromRoute = computed(() => route.meta.tab || 'home');
const tabsNeedingSupplementalData = new Set([
  'home',
  'markets',
  'products',
  'merchants',
  'request',
]);

watch(
  () => [route.path, route.params.marketId, route.params.productId, tabFromRoute.value],
  () => {
    const tab = tabFromRoute.value;
    if (publicTab.value !== tab) setPublicTab(tab);

    if (route.params.marketId) {
      if (selectedMarketId.value !== route.params.marketId) {
        setSelectedMarketId(route.params.marketId);
      }
    } else if (route.name === 'Markets') {
      if (selectedMarketId.value != null) setSelectedMarketId(null);
    }

    if (route.params.productId) {
      if (selectedProductId.value !== route.params.productId) {
        setSelectedProductId(route.params.productId);
      }
    } else if (route.name === 'Products') {
      if (selectedProductId.value != null) setSelectedProductId(null);
    }

    if (route.params.merchantId) {
      if (!sameId(selectedMerchantId.value, route.params.merchantId)) {
        setSelectedMerchantId(route.params.merchantId);
      }
    } else if (route.name === 'Merchants') {
      if (selectedMerchantId.value != null) setSelectedMerchantId(null);
    }
  },
  { immediate: true },
);

watch(
  () => publicTab.value,
  (tab) => {
    if (tabsNeedingSupplementalData.has(tab)) {
      void ensurePublicSupplementalData();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (tabsNeedingSupplementalData.has(publicTab.value)) {
    void ensurePublicSupplementalData();
  }
});
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col justify-between text-foreground">
    <Navigation />

    <main class="flex-1">
      <ProfilePage v-if="publicTab === 'profile'" />

      <PublicHome v-else-if="publicTab === 'home'" />

      <template v-else-if="publicTab === 'markets'">
        <div v-if="!initialized" class="py-20 text-center text-muted-foreground text-sm">
          Chargement des marchés...
        </div>
        <PublicMarketDetail v-else-if="selectedMarketId" />
        <PublicMarketsList v-else />
      </template>

      <template v-else-if="publicTab === 'products'">
        <PublicProductDetails v-if="selectedProductId" />
        <PublicProductsSection
          v-else
          :products="products"
          :markets="markets"
          :product-categories="productCategories"
          :on-select-product="goToProduct"
        />
      </template>

      <PublicPriceTrends v-else-if="publicTab === 'price-trends'" />

      <template v-else-if="publicTab === 'merchants'">
        <PublicMerchantProfile v-if="selectedMerchantId" />
        <PublicMerchantsSection
          v-else
          :merchants="merchants"
          :markets="markets"
          :product-categories="productCategories"
          :on-select-merchant="goToMerchant"
        />
      </template>

      <PublicRequestPlace v-else-if="publicTab === 'request'" />
    </main>

    <PublicFooter :on-go-home="goHome" :on-go-to-tab="goToTab" />

    <div
      v-if="toast"
      class="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-white animate-fadeIn"
    >
      <span
        :class="`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-400' : 'bg-emerald-400'} animate-ping`"
      />
      <span class="text-xs font-extrabold">{{ toast.message }}</span>
    </div>
  </div>
</template>
