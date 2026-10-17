<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Tags } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import {
  fetchAllProductCategories,
  createProductCategory,
  updateProductCategoryApi,
  deleteProductCategoryApi,
} from '../../../../api/services/data.js';
import { getErrorMessage } from '../../../../api/client.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import CategoriesTable from '../../categories/CategoriesTable.vue';
import CategoryFormDialog from '../../categories/CategoryFormDialog.vue';
import Input from '../../ui/Input.vue';
import Button from '../../ui/Button.vue';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

const { showToast, loadProductCategories } = useApp();

const categories = ref([]);
const searchQuery = ref('');
const formOpen = ref(false);
const deleteOpen = ref(false);
const editingCategory = ref(null);
const categoryToDelete = ref(null);
const loading = ref(false);
const deleting = ref(false);

async function refreshCategories() {
  loading.value = true;
  try {
    categories.value = await fetchAllProductCategories();
    await loadProductCategories();
  } catch (error) {
    showToast(getErrorMessage(error, 'Erreur de chargement des catégories'), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refreshCategories();
});

const filteredCategories = computed(() =>
  categories.value.filter((c) => {
    const q = searchQuery.value.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }),
);

const openCreate = () => {
  editingCategory.value = null;
  formOpen.value = true;
};

const openEdit = (category) => {
  editingCategory.value = category;
  formOpen.value = true;
};

const openDelete = (category) => {
  categoryToDelete.value = category;
  deleteOpen.value = true;
};

const handleFormSubmit = async (payload) => {
  try {
    if (payload.id) {
      await updateProductCategoryApi(payload.id, payload);
      showToast(`Catégorie "${payload.name}" mise à jour`, 'success');
    } else {
      await createProductCategory(payload);
      showToast(`Catégorie "${payload.name}" créée avec succès`, 'success');
    }
    formOpen.value = false;
    await refreshCategories();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const confirmDelete = async () => {
  if (!categoryToDelete.value || deleting.value) return;
  deleting.value = true;
  try {
    await deleteProductCategoryApi(categoryToDelete.value.id);
    showToast('Catégorie supprimée', 'success');
    deleteOpen.value = false;
    categoryToDelete.value = null;
    await refreshCategories();
  } catch (error) {
    showToast(getErrorMessage(error, 'Impossible de supprimer cette catégorie'), 'error');
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      action-label="Ajouter une catégorie"
      :action-icon="Plus"
      @action="openCreate"
    />

    

    <FilterBar :show-clear="Boolean(searchQuery)" @clear="searchQuery = ''">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom ou description..." class="pl-9 bg-card" />
        </div>
      </div>
    </FilterBar>

    <CategoriesTable
      :categories="filteredCategories"
      :loading="loading"
      @edit="openEdit"
      @delete="openDelete"
    />

    <CategoryFormDialog
      v-model:open="formOpen"
      :category="editingCategory"
      @submit="handleFormSubmit"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
          <AlertDialogDescription>
            La catégorie <strong>{{ categoryToDelete?.name }}</strong> sera définitivement supprimée.
            <span v-if="categoryToDelete?.productsCount">
              {{ categoryToDelete.productsCount }} produit(s) perdront leur catégorie.
            </span>
            <span v-if="categoryToDelete?.marketsCount">
              Elle sera retirée de {{ categoryToDelete.marketsCount }} marché(s).
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleting">Annuler</AlertDialogCancel>
          <Button
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>