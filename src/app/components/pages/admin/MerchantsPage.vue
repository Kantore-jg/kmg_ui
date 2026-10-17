<script setup>
import { ref, computed } from 'vue';
import { Search, Users, ShieldCheck, Package, Printer } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../../composables/usePrintReport.js';
import { getAdministrativeLocationLabel } from '../../../../utils/burundiLocations.js';
import Button from '../../ui/Button.vue';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import MerchantsTable from '../../merchants/MerchantsTable.vue';
import MerchantViewDialog from '../../merchants/MerchantViewDialog.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

const { productCategories } = useApp();

const {
  scopedMerchants,
  scopedMarkets,
  scopedProducts,
  findMarket,
  assignedMarketId,
} = useAdminScope();

const { openMerchantsPrint } = usePrintReport();

const searchQuery = ref('');
const marketFilter = ref('all');
const categoryFilter = ref('all');
const viewOpen = ref(false);
const viewingMerchant = ref(null);

const categories = computed(() => productCategories.value);

const filteredMerchants = computed(() =>
  scopedMerchants.value.filter((m) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.category.toLowerCase().includes(q);
    const matchesMarket =
      marketFilter.value === 'all' || m.activeMarketId === marketFilter.value;
    const matchesCategory =
      categoryFilter.value === 'all' || m.category === categoryFilter.value;
    return matchesQuery && matchesMarket && matchesCategory;
  }),
);

const verifiedCount = computed(() =>
  scopedMerchants.value.filter((m) => m.verified).length,
);

const totalProducts = computed(() => scopedProducts.value.length);

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

const viewingProductsCount = computed(() => {
  if (!viewingMerchant.value) return 0;
  return scopedProducts.value.filter(
    (p) => p.merchantId === viewingMerchant.value.id,
  ).length;
});
</script>

<template>
  <div class="space-y-6">
    

    

    <FilterBar
      :show-clear="searchQuery || marketFilter !== 'all' || categoryFilter !== 'all'"
      @clear="searchQuery = ''; marketFilter = 'all'; categoryFilter = 'all'"
    >
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom, téléphone..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full lg:w-44">
        <label class="text-xs font-medium text-muted-foreground">Marché</label>
        <Select v-model="marketFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les marchés</SelectItem>
            <SelectItem v-for="m in scopedMarkets" :key="m.id" :value="m.id">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full lg:w-44">
        <label class="text-xs font-medium text-muted-foreground">Filière</label>
        <Select v-model="categoryFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Toutes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes filières</SelectItem>
            <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </SelectItem>
          </SelectContent>
        </Select>
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
      :products-count="viewingProductsCount"
    />
  </div>
</template>
