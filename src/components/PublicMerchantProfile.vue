<script setup>
import { computed } from 'vue';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-vue-next';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import { sameId } from '../utils/ids.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';

const { merchants, markets, selectedMerchantId, showToast } = useApp();
const { goToMerchantsList } = usePublicNavigation();

const merchant = computed(() =>
  merchants.value.find((item) => sameId(item.id, selectedMerchantId.value)),
);

const merchantMarket = computed(() => {
  if (!merchant.value) return null;
  return markets.value.find((market) => sameId(market.id, merchant.value.activeMarketId))
    || markets.value.find((market) => sameId(market.id, merchant.value.marketId))
    || null;
});

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

    <section class="bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
      <h1 class="text-3xl font-extrabold text-slate-900">{{ merchant.name }}</h1>
      <p class="text-sm text-slate-500">{{ backLabel }}</p>
      <p v-if="merchant.category" class="text-sm font-medium">{{ merchant.category }}</p>
      <p v-if="merchant.activePlaceNumber" class="text-sm">Étal {{ merchant.activePlaceNumber }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-2 bg-primary text-slate-950 font-bold px-4 py-2 rounded-xl text-sm"
        @click="contactWhatsapp"
      >
        <MessageCircle class="w-4 h-4" />
        <Phone class="w-4 h-4" />
        Contacter
      </button>
    </section>
  </div>
</template>
