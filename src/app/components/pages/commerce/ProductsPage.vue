<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Upload, Download } from 'lucide-vue-next';
import {
  fetchCommerceProducts,
  fetchCommerceCategories,
  createCommerceProduct,
  updateCommerceProduct,
  deleteCommerceProduct,
  importCommerceProducts,
  exportCommerceProducts,
} from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import { useCommerceScope } from '../../../../composables/useCommerceScope.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import Badge from '../../ui/Badge.vue';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();
const { canManageProducts } = useCommerceScope();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const formOpen = ref(false);
const editing = ref(null);
const saving = ref(false);
const importInput = ref(null);

const emptyForm = () => ({
  name: '',
  sku: '',
  barcode: '',
  unit: 'unit',
  categoryId: '',
  purchasePrice: 0,
  salePrice: 0,
  minStock: 0,
  status: 'active',
});

const form = ref(emptyForm());

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return products.value.filter((p) =>
    !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
  );
});

async function refresh() {
  loading.value = true;
  try {
    [products.value, categories.value] = await Promise.all([
      fetchCommerceProducts(),
      fetchCommerceCategories(),
    ]);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void refresh(); });

const openCreate = () => {
  editing.value = null;
  form.value = emptyForm();
  formOpen.value = true;
};

const openEdit = (product) => {
  editing.value = product;
  form.value = {
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    unit: product.unit,
    categoryId: product.categoryId ? String(product.categoryId) : '',
    purchasePrice: product.purchasePrice,
    salePrice: product.salePrice,
    minStock: product.minStock,
    status: product.status,
  };
  formOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    showToast('Le nom est obligatoire', 'error');
    return;
  }
  saving.value = true;
  const payload = {
    ...form.value,
    categoryId: form.value.categoryId ? Number(form.value.categoryId) : null,
  };
  try {
    if (editing.value) {
      await updateCommerceProduct(editing.value.id, payload);
      showToast('Produit mis à jour', 'success');
    } else {
      await createCommerceProduct(payload);
      showToast('Produit créé', 'success');
    }
    formOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (product) => {
  if (!confirm(`Désactiver "${product.name}" ?`)) return;
  try {
    await deleteCommerceProduct(product.id);
    showToast('Produit désactivé', 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const handleImport = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await importCommerceProducts(file);
    showToast(`Import terminé (${result.created || 0} créés)`, 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    e.target.value = '';
  }
};

const handleExport = async () => {
  try {
    const result = await exportCommerceProducts();
    const blob = new Blob([result.csv || ''], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'produits.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Produits" subtitle="Catalogue produits">
      <template #actions>
        <template v-if="canManageProducts">
          <Button variant="outline" @click="importInput?.click()">
            <Upload class="w-4 h-4" /> Importer
          </Button>
          <input ref="importInput" type="file" accept=".csv,.txt" class="hidden" @change="handleImport" />
          <Button variant="outline" @click="handleExport">
            <Download class="w-4 h-4" /> Exporter
          </Button>
          <Button @click="openCreate"><Plus class="w-4 h-4" /> Ajouter</Button>
        </template>
      </template>
    </PageHeader>

    <div class="relative max-w-md">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Rechercher..." class="pl-9 bg-card" />
    </div>

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix achat</TableHead>
            <TableHead>Prix vente</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead v-if="canManageProducts" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-for="product in filteredProducts" :key="product.id">
            <TableCell>
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-xs text-muted-foreground">{{ product.sku || product.unit }}</div>
            </TableCell>
            <TableCell>{{ product.categoryName || '—' }}</TableCell>
            <TableCell>{{ formatFbu(product.purchasePrice) }}</TableCell>
            <TableCell>{{ formatFbu(product.salePrice) }}</TableCell>
            <TableCell>
              <Badge :class="product.status === 'active' ? 'bg-success/15 text-success border-0' : 'bg-muted border-0'">
                {{ product.status === 'active' ? 'Actif' : 'Inactif' }}
              </Badge>
            </TableCell>
            <TableCell v-if="canManageProducts" class="text-right space-x-2">
              <Button variant="outline" size="sm" @click="openEdit(product)">Modifier</Button>
              <Button variant="outline" size="sm" class="text-destructive" @click="handleDelete(product)">Désactiver</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Modifier le produit' : 'Nouveau produit' }}</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="grid gap-1.5"><Label>Nom *</Label><Input v-model="form.name" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5"><Label>SKU</Label><Input v-model="form.sku" /></div>
            <div class="grid gap-1.5"><Label>Unité</Label><Input v-model="form.unit" /></div>
          </div>
          <div class="grid gap-1.5">
            <Label>Catégorie</Label>
            <Select v-model="form.categoryId">
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                <SelectItem v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5"><Label>Prix achat</Label><Input v-model.number="form.purchasePrice" type="number" min="0" /></div>
            <div class="grid gap-1.5"><Label>Prix vente</Label><Input v-model.number="form.salePrice" type="number" min="0" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5"><Label>Stock minimum</Label><Input v-model.number="form.minStock" type="number" min="0" /></div>
            <div class="grid gap-1.5">
              <Label>Statut</Label>
              <Select v-model="form.status">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="formOpen = false">Annuler</Button>
          <Button :disabled="saving" @click="handleSubmit">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
