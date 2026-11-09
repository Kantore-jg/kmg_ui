<script setup>
import { ref, computed } from 'vue';
import { MessageCircle } from 'lucide-vue-next';
import { sameId } from '../utils/ids.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import { useApp } from '../composables/useApp.js';

const props = defineProps({
  merchants: { type: Array, default: () => [] },
  markets: { type: Array, default: () => [] },
});

const { showToast } = useApp();
const merchantQuery = ref('');

const getMarketById = (marketId) => props.markets.find((market) => sameId(market.id, marketId));

const getMarketLabel = (marketId) => {
  const market = getMarketById(marketId);
  if (!market) return '—';
  return market.name || getAdministrativeLocationLabel(market) || '—';
};

const filteredMerchants = computed(() =>
  props.merchants.filter((m) => {
    const query = merchantQuery.value.trim().toLowerCase();
    if (!query) return true;
    return (
      m.name.toLowerCase().includes(query)
      || String(m.id).includes(query)
      || (m.phone || '').toLowerCase().includes(query)
      || (m.activePlaceNumber || '').toLowerCase().includes(query)
      || (m.category || '').toLowerCase().includes(query)
      || getMarketLabel(m.activeMarketId).toLowerCase().includes(query)
    );
  }),
);

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/\//g, '-');
}

function contactWhatsapp(merchant) {
  if (!merchant?.phone) {
    showToast('Ce commerçant n\'a pas de numéro disponible.', 'info');
    return;
  }

  const phone = String(merchant.phone).replace(/\s+/g, '');
  window.open(`https://wa.me/${phone}`, '_blank', 'noreferrer');
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
    <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-lg font-semibold text-slate-800 sm:text-xl">
          Le Nombre total des commerçants :
          <span class="text-sky-700">{{ filteredMerchants.length }}</span>
        </h1>

        <div class="space-y-1 sm:min-w-[16rem]">
          <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rechercher ici
          </label>
          <input
            v-model="merchantQuery"
            type="search"
            placeholder="Nom, téléphone, étal, marché..."
            class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
      </div>

      <div class="px-5 py-4">
        <h2 class="mb-3 text-base font-semibold text-slate-800">
          Liste des commerçants
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th class="px-3 py-3 w-10">#</th>
                <th class="px-3 py-3">Numéro</th>
                <th class="px-3 py-3">Nom</th>
                <th class="px-3 py-3">Téléphone</th>
                <th class="px-3 py-3">Étal</th>
                <th class="px-3 py-3">Marché</th>
                <th class="px-3 py-3">Date</th>
                <th class="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredMerchants.length">
                <td colspan="8" class="px-3 py-10 text-center text-slate-400">
                  Aucun commerçant trouvé.
                </td>
              </tr>
              <tr
                v-for="(merchant, index) in filteredMerchants"
                :key="merchant.id"
                class="border-b border-slate-100 hover:bg-slate-50/80"
              >
                <td class="px-3 py-3 text-slate-500">{{ index + 1 }}</td>
                <td class="px-3 py-3 font-medium text-slate-700">{{ merchant.id }}</td>
                <td class="px-3 py-3 font-medium text-slate-800">{{ merchant.name }}</td>
                <td class="px-3 py-3 text-slate-700">{{ merchant.phone || '—' }}</td>
                <td class="px-3 py-3 text-slate-700">
                  {{ merchant.activePlaceNumber || merchant.activePlaceId || '—' }}
                </td>
                <td class="px-3 py-3 text-slate-700">
                  {{ getMarketLabel(merchant.activeMarketId) }}
                </td>
                <td class="px-3 py-3 whitespace-nowrap text-slate-600">
                  {{ formatDate(merchant.joinedDate) }}
                </td>
                <td class="px-3 py-3 text-right">
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-sm bg-emerald-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                    @click="contactWhatsapp(merchant)"
                  >
                    <MessageCircle class="h-3.5 w-3.5" />
                    Contacter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
