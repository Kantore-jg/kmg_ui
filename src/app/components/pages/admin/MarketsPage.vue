<script setup>
import { ref, computed } from 'vue';
import { Plus, Search, Store } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { sameId } from '../../../../utils/ids.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import MarketsTable from '../../markets/MarketsTable.vue';
import MarketFormDialog from '../../markets/MarketFormDialog.vue';
import MarketViewDialog from '../../markets/MarketViewDialog.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

const { markets, places, merchants, products, addMarket, updateMarket, deleteMarket } = useApp();

const searchQuery = ref('');
const provinceFilter = ref('all');
const formOpen = ref(false);
const viewOpen = ref(false);
const deleteOpen = ref(false);
const editingMarket = ref(null);
const viewingMarket = ref(null);
const marketToDelete = ref(null);

const provinces = computed(() => {
  const set = new Set(markets.value.map((m) => m.province).filter(Boolean));
  return Array.from(set).sort();
});

const filteredMarkets = computed(() => {
  return markets.value.filter((m) => {
    const q = searchQuery.value.toLowerCase();
    const locationLabel = [m.province, m.commune, m.zone, m.colline].filter(Boolean).join(' ');
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      locationLabel.toLowerCase().includes(q);
    const matchesProvince = provinceFilter.value === 'all' || m.province === provinceFilter.value;
    return matchesQuery && matchesProvince;
  });
});

const totalPlaces = computed(() =>
  markets.value.reduce((sum, m) => sum + m.totalPlaces, 0),
);

const totalOccupied = computed(() =>
  markets.value.reduce((sum, m) => sum + m.occupiedPlaces, 0),
);

const avgOccupation = computed(() => {
  if (!totalPlaces.value) return 0;
  return Math.round((totalOccupied.value / totalPlaces.value) * 100);
});

const getMarketStats = (marketId) => ({
  places: places.value.filter((p) => sameId(p.marketId, marketId)).length,
  merchants: merchants.value.filter((m) => sameId(m.activeMarketId, marketId)).length,
  products: products.value.filter((p) => sameId(p.marketId, marketId)).length,
});

const openCreate = () => {
  editingMarket.value = null;
  formOpen.value = true;
};

const openEdit = (market) => {
  editingMarket.value = market;
  formOpen.value = true;
};

const openView = (market) => {
  viewingMarket.value = market;
  viewOpen.value = true;
};

const openDelete = (market) => {
  marketToDelete.value = market;
  deleteOpen.value = true;
};

const handleFormSubmit = (payload) => {
  if (payload.id) {
    updateMarket(payload);
  } else {
    addMarket(payload);
  }
};

const confirmDelete = () => {
  if (marketToDelete.value) {
    deleteMarket(marketToDelete.value.id);
  }
  deleteOpen.value = false;
  marketToDelete.value = null;
};

const viewingStats = computed(() => {
  if (!viewingMarket.value) return { places: 0, merchants: 0, products: 0 };
  return getMarketStats(viewingMarket.value.id);
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      action-label="Ajouter un marché"
      :action-icon="Plus"
      @action="openCreate"
    />
    <FilterBar :show-clear="searchQuery || provinceFilter !== 'all'" @clear="searchQuery = ''; provinceFilter = 'all'">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom, province ou commune..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full sm:w-48">
        <label class="text-xs font-medium text-muted-foreground">Province</label>
        <Select v-model="provinceFilter">
          <SelectTrigger class="bg-card">
            <SelectValue placeholder="Toutes les provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les provinces</SelectItem>
            <SelectItem v-for="province in provinces" :key="province" :value="province">{{ province }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <MarketsTable
      :markets="filteredMarkets"
      @view="openView"
      @edit="openEdit"
      @delete="openDelete"
    />

    <MarketFormDialog
      v-model:open="formOpen"
      :market="editingMarket"
      @submit="handleFormSubmit"
    />

    <MarketViewDialog
      v-model:open="viewOpen"
      :market="viewingMarket"
      :places-count="viewingStats.places"
      :merchants-count="viewingStats.merchants"
      :products-count="viewingStats.products"
      @edit="openEdit"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce marché ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le marché
            <strong>{{ marketToDelete?.name }}</strong>
            sera retiré du registre. Les marchés avec des emplacements ou produits associés ne peuvent pas être supprimés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmDelete"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
