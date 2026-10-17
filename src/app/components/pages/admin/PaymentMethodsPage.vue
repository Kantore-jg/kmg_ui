<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Plus, Search, Landmark } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../../../../api/services/data.js';
import { getErrorMessage } from '../../../../api/client.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import Badge from '../../ui/Badge.vue';
import Switch from '../../ui/Switch.vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

const { showToast, markets } = useApp();
const { isSuperAdmin, isMarketOwner, assignedMarketId, scopedMarkets } = useAdminScope();

const methods = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const marketFilter = ref('all');
const formOpen = ref(false);
const editing = ref(null);
const form = ref({
  name: '',
  type: 'bank',
  accountNumber: '',
  accountName: '',
  isActive: true,
  marketId: null,
});

const canManage = computed(() => !isMarketOwner.value);
const typeLabels = {
  bank: 'Banque',
  mobile_money: 'Mobile money',
  cash: 'Espèces',
};

const filteredMethods = computed(() =>
  methods.value.filter((m) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.accountNumber.toLowerCase().includes(q) ||
      m.accountName.toLowerCase().includes(q);
    const matchesMarket =
      marketFilter.value === 'all' || String(m.marketId) === String(marketFilter.value);
    return matchesQuery && matchesMarket;
  }),
);

const activeCount = computed(() => methods.value.filter((m) => m.isActive).length);

async function refresh() {
  loading.value = true;
  try {
    const params = {};
    if (isSuperAdmin.value && marketFilter.value !== 'all') {
      params.market_id = marketFilter.value;
    }
    methods.value = await fetchPaymentMethods(params);
  } catch (error) {
    showToast(getErrorMessage(error, 'Erreur de chargement'), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refresh();
});

watch(marketFilter, () => {
  if (isSuperAdmin.value) void refresh();
});

const openCreate = () => {
  editing.value = null;
  form.value = {
    name: '',
    type: 'bank',
    accountNumber: '',
    accountName: '',
    isActive: true,
    marketId: assignedMarketId.value || scopedMarkets.value[0]?.id || null,
  };
  formOpen.value = true;
};

const openEdit = (method) => {
  editing.value = method;
  form.value = {
    name: method.name,
    type: method.type,
    accountNumber: method.accountNumber,
    accountName: method.accountName,
    isActive: method.isActive,
    marketId: method.marketId,
  };
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) return;
  if (isSuperAdmin.value && !form.value.marketId) {
    showToast('Sélectionnez un marché', 'error');
    return;
  }
  try {
    if (editing.value) {
      await updatePaymentMethod(editing.value.id, form.value);
      showToast('Moyen de paiement mis à jour', 'success');
    } else {
      await createPaymentMethod(form.value);
      showToast('Moyen de paiement créé', 'success');
    }
    formOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const handleDeactivate = async (method) => {
  try {
    await deletePaymentMethod(method.id);
    showToast('Moyen de paiement désactivé', 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const marketName = (id) => markets.value.find((m) => m.id == id)?.name || '—';
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Moyens de paiement"
      :action-label="canManage ? 'Ajouter' : ''"
      :action-icon="Plus"
      @action="openCreate"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard title="Total" :value="methods.length" :icon="Landmark" color="primary" />
      <StatCard title="Actifs" :value="activeCount" :icon="Landmark" color="success" />
    </div>

    <FilterBar
      :show-clear="searchQuery || marketFilter !== 'all'"
      @clear="searchQuery = ''; marketFilter = 'all'"
    >
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Banque, compte..." class="pl-9 bg-card" />
        </div>
      </div>
      <div v-if="isSuperAdmin" class="space-y-1 w-full sm:w-56">
        <label class="text-xs font-medium text-muted-foreground">Marché</label>
        <Select v-model="marketFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les marchés</SelectItem>
            <SelectItem v-for="m in markets" :key="m.id" :value="String(m.id)">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead v-if="isSuperAdmin">Marché</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Compte</TableHead>
            <TableHead>Titulaire</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead v-if="canManage" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="canManage ? 7 : 6" class="text-center py-8 text-muted-foreground">
              Chargement...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!filteredMethods.length">
            <TableCell :colspan="canManage ? 7 : 6" class="text-center py-8 text-muted-foreground">
              Aucun moyen de paiement.
            </TableCell>
          </TableRow>
          <TableRow v-for="m in filteredMethods" :key="m.id">
            <TableCell class="font-medium">{{ m.name }}</TableCell>
            <TableCell v-if="isSuperAdmin">{{ marketName(m.marketId) }}</TableCell>
            <TableCell>{{ typeLabels[m.type] || m.type }}</TableCell>
            <TableCell>{{ m.accountNumber || '—' }}</TableCell>
            <TableCell>{{ m.accountName || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="m.isActive ? 'default' : 'secondary'">
                {{ m.isActive ? 'Actif' : 'Inactif' }}
              </Badge>
            </TableCell>
            <TableCell v-if="canManage" class="text-right">
              <div class="flex justify-end gap-2">
                <Button size="sm" variant="outline" @click="openEdit(m)">Modifier</Button>
                <Button
                  v-if="m.isActive"
                  size="sm"
                  variant="outline"
                  class="text-destructive"
                  @click="handleDeactivate(m)"
                >
                  Désactiver
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog :open="formOpen" @update:open="formOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Modifier' : 'Nouveau moyen de paiement' }}</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div v-if="isSuperAdmin && !editing" class="space-y-2">
            <Label>Marché</Label>
            <Select v-model="form.marketId">
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in markets" :key="m.id" :value="m.id">{{ m.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Nom</Label>
            <Input v-model="form.name" required placeholder="Ex. Banque de Burundi" />
          </div>
          <div class="space-y-2">
            <Label>Type</Label>
            <Select v-model="form.type">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Banque</SelectItem>
                <SelectItem value="mobile_money">Mobile money</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>N° compte</Label>
            <Input v-model="form.accountNumber" />
          </div>
          <div class="space-y-2">
            <Label>Titulaire</Label>
            <Input v-model="form.accountName" />
          </div>
          <div class="flex items-center justify-between">
            <Label>Actif</Label>
            <Switch :checked="form.isActive" @update:checked="form.isActive = $event" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="closeForm">Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
