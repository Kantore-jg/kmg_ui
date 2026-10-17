<script setup>
import { ref, computed } from 'vue';
import { Plus, Search, Printer } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../../composables/usePrintReport.js';
import Button from '../../ui/Button.vue';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import ProductsTable from '../../products/ProductsTable.vue';
import ProductFormDialog from '../../products/ProductFormDialog.vue';
import Input from '../../ui/Input.vue';
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

const { addProduct, updateProduct, deleteProduct, productCategories } = useApp();
const {
  isMerchant,
  scopedProducts,
  scopedMarkets,
  scopedMerchants,
  assignedMarketId,
  assignedMerchant,
} = useAdminScope();

const { openProductsPrint } = usePrintReport();

const searchQuery = ref('');
const merchantFilter = ref('all');
const categoryFilter = ref('all');
const formOpen = ref(false);
const deleteOpen = ref(false);
const editingProduct = ref(null);
const productToDelete = ref(null);
const saving = ref(false);

const categories = computed(() => productCategories.value);

const getMerchantName = (merchantId) =>
  scopedMerchants.value.find((m) => String(m.id) === String(merchantId))?.name || '—';

const getMarketCity = (marketId) => {
  const market = scopedMarkets.value.find((m) => String(m.id) === String(marketId));
  return market?.colline || market?.zone || '—';
};


const filteredProducts = computed(() =>
  scopedProducts.value.filter((p) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchesCat =
      categoryFilter.value === 'all' ||
      p.category === categoryFilter.value ||
      String(p.categoryId) === String(categoryFilter.value);
    const matchesMerchant =
      merchantFilter.value === 'all' || p.merchantId == merchantFilter.value;
    return matchesQuery && matchesCat && matchesMerchant;
  }),
);

const handlePrint = () =>
  openProductsPrint({
    marketId: assignedMarketId.value || undefined,
    merchantId:
      merchantFilter.value !== 'all'
        ? merchantFilter.value
        : isMerchant.value
          ? assignedMerchant.value?.id
          : undefined,
  });

const pageTitle = computed(() =>
  isMerchant.value ? 'Gestion De Mes Produits' : 'Gestion Des Produits',
);

const openCreate = () => {
  editingProduct.value = null;
  formOpen.value = true;
};

const openEdit = (product) => {
  editingProduct.value = product;
  formOpen.value = true;
};

const openDelete = (product) => {
  productToDelete.value = product;
  deleteOpen.value = true;
};

const handleSubmit = async (payload) => {
  saving.value = true;
  try {
    if (payload.id) {
      await updateProduct(payload);
    } else {
      await addProduct(payload);
    }
  } finally {
    saving.value = false;
  }
};

const handleToggleAvailability = async (product) => {
  await updateProduct({
    ...product,
    available: product.available === false,
  });
};

const confirmDelete = async () => {
  if (productToDelete.value) {
    await deleteProduct(productToDelete.value.id);
  }
  deleteOpen.value = false;
  productToDelete.value = null;
};

const clearFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = 'all';
  merchantFilter.value = 'all';
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="pageTitle"
      action-label="Ajouter un produit"
      :action-icon="Plus"
      @action="openCreate"
    >
    <!-- subtitle="Configuration et contrôle des éléments de votre marché." -->

      <template #actions>
        <Button variant="outline" class="rounded-full" @click="handlePrint">
          <Printer class="w-4 h-4" />
          {{ isMerchant ? 'Imprimer mon catalogue' : 'Imprimer le catalogue' }}
        </Button>
      </template>
    </PageHeader>

    <FilterBar :show-clear="searchQuery || categoryFilter !== 'all' || merchantFilter !== 'all'" @clear="clearFilters">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom ou catégorie..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full sm:w-48">
        <label class="text-xs font-medium text-muted-foreground">Catégorie</label>
        <Select v-model="categoryFilter">
          <SelectTrigger class="bg-card">
            <SelectValue placeholder="Toutes catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="!isMerchant" class="space-y-1 w-full sm:w-48">
        <label class="text-xs font-medium text-muted-foreground">Commerçant</label>
        <Select v-model="merchantFilter">
          <SelectTrigger class="bg-card">
            <SelectValue placeholder="Tous commerçants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous commerçants</SelectItem>
            <SelectItem v-for="m in scopedMerchants" :key="m.id" :value="m.id">
              {{ m.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <div v-if="filteredProducts.length === 0" class="bs-card p-12 text-center text-muted-foreground text-sm">
      Aucun produit dans le catalogue.
    </div>

    <div v-else class="space-y-3">
      <ProductsTable
        :products="filteredProducts"
        :get-merchant-name="getMerchantName"
        :get-market-city="getMarketCity"
        @edit="openEdit"
        @delete="openDelete"
        @toggle-availability="handleToggleAvailability"
      />
    </div>

    <ProductFormDialog
      v-model:open="formOpen"
      :product="editingProduct"
      :markets="scopedMarkets"
      :merchants="scopedMerchants"
      :is-merchant="isMerchant"
      :default-merchant="assignedMerchant"
      :default-market-id="assignedMarketId || ''"
      @submit="handleSubmit"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le produit <strong>{{ productToDelete?.name }}</strong> sera retiré du catalogue.
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
