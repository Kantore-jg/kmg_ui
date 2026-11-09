<script setup>
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../../composables/usePrintReport.js';
import { getAdministrativeLocationLabel } from '../../../../utils/burundiLocations.js';
import FilterBar from '../../layout/FilterBar.vue';
import MerchantsTable from '../../merchants/MerchantsTable.vue';
import MerchantViewDialog from '../../merchants/MerchantViewDialog.vue';
import Input from '../../ui/Input.vue';

const {
  scopedMerchants,
  findMarket,
  assignedMarketId,
} = useAdminScope();

const { openMerchantsPrint } = usePrintReport();

const searchQuery = ref('');
const marketFilter = ref('all');
const viewOpen = ref(false);
const viewingMerchant = ref(null);

const filteredMerchants = computed(() =>
  scopedMerchants.value.filter((m) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.category || '').toLowerCase().includes(q);
    const matchesMarket =
      marketFilter.value === 'all' || m.activeMarketId === marketFilter.value;
    return matchesQuery && matchesMarket;
  }),
);

const getMarketLabel = (marketId) => {
  const m = findMarket(marketId);
  return m ? getAdministrativeLocationLabel(m) : '—';
};

const openView = (merchant) => {
  viewingMerchant.value = merchant;
  viewOpen.value = true;
};

const printMarketId = computed(() => {
  if (marketFilter.value !== 'all') return marketFilter.value;
  return assignedMarketId.value || undefined;
});

const handlePrint = () => openMerchantsPrint(printMarketId.value);
</script>

<template>
  <div class="space-y-6">
    <FilterBar
      :show-clear="searchQuery || marketFilter !== 'all'"
      @clear="searchQuery = ''; marketFilter = 'all'"
    >
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom, téléphone..." class="pl-9 bg-card" />
        </div>
      </div>
    </FilterBar>

    <MerchantsTable
      :merchants="filteredMerchants"
      :get-market-label="getMarketLabel"
      @view="openView"
    />

    <MerchantViewDialog
      v-model:open="viewOpen"
      :merchant="viewingMerchant"
      :market-name="viewingMerchant ? findMarket(viewingMerchant.activeMarketId)?.name : ''"
    />
  </div>
</template>
