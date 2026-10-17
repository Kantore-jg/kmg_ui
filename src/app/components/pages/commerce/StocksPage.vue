<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import {
  fetchCommerceStocks,
  createCommerceStock,
  updateCommerceStock,
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

const { showToast } = useApp();
const { canManageStocks } = useCommerceScope();

const stocks = ref([]);
const loading = ref(true);
const formOpen = ref(false);
const editing = ref(null);
const saving = ref(false);
const form = ref({ name: '', location: '', status: 'active' });

async function refresh() {
  loading.value = true;
  try {
    stocks.value = await fetchCommerceStocks();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void refresh(); });

const openCreate = () => {
  editing.value = null;
  form.value = { name: '', location: '', status: 'active' };
  formOpen.value = true;
};

const openEdit = (stock) => {
  editing.value = stock;
  form.value = { name: stock.name, location: stock.location, status: stock.status };
  formOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    showToast('Le nom est obligatoire', 'error');
    return;
  }
  saving.value = true;
  try {
    if (editing.value) {
      await updateCommerceStock(editing.value.id, form.value);
      showToast('Stock mis à jour', 'success');
    } else {
      await createCommerceStock(form.value);
      showToast('Stock créé', 'success');
    }
    formOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Mes stocks"
      subtitle="Gestion des entrepôts"
      :action-label="canManageStocks ? 'Ajouter un stock' : ''"
      :action-icon="Plus"
      @action="openCreate"
    />

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Emplacement</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead v-if="canManageStocks" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-for="stock in stocks" :key="stock.id">
            <TableCell class="font-medium">{{ stock.name }}</TableCell>
            <TableCell>{{ stock.location || '—' }}</TableCell>
            <TableCell>{{ stock.items?.length || 0 }} produit(s)</TableCell>
            <TableCell>
              <Badge :class="stock.status === 'active' ? 'bg-success/15 text-success border-0' : 'bg-muted border-0'">
                {{ stock.status === 'active' ? 'Actif' : 'Inactif' }}
              </Badge>
            </TableCell>
            <TableCell v-if="canManageStocks" class="text-right">
              <Button variant="outline" size="sm" @click="openEdit(stock)">Modifier</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Modifier le stock' : 'Nouveau stock' }}</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="grid gap-1.5"><Label>Nom *</Label><Input v-model="form.name" /></div>
          <div class="grid gap-1.5"><Label>Emplacement</Label><Input v-model="form.location" /></div>
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
        <DialogFooter>
          <Button variant="outline" @click="formOpen = false">Annuler</Button>
          <Button :disabled="saving" @click="handleSubmit">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
