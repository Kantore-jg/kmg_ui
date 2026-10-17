<script setup>
import { ref, onMounted, watch } from 'vue';
import { fetchCommerceMovements, fetchCommerceStocks } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import FilterBar from '../../layout/FilterBar.vue';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();

const movements = ref([]);
const stocks = ref([]);
const loading = ref(true);
const filters = ref({
  stockId: 'all',
  type: 'all',
  from: '',
  to: '',
});

async function refresh() {
  loading.value = true;
  try {
    const params = {};
    if (filters.value.stockId !== 'all') params.stock_id = filters.value.stockId;
    if (filters.value.type !== 'all') params.type = filters.value.type;
    if (filters.value.from) params.from = filters.value.from;
    if (filters.value.to) params.to = filters.value.to;
    movements.value = await fetchCommerceMovements(params);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    stocks.value = await fetchCommerceStocks();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
  await refresh();
});

watch(filters, () => { void refresh(); }, { deep: true });
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Mouvements" subtitle="Historique des mouvements de stock" />

    <FilterBar @clear="filters = { stockId: 'all', type: 'all', from: '', to: '' }">
      <div class="space-y-1 w-full sm:w-40">
        <Label class="text-xs">Stock</Label>
        <Select v-model="filters.stockId">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem v-for="s in stocks" :key="s.id" :value="String(s.id)">{{ s.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full sm:w-40">
        <Label class="text-xs">Type</Label>
        <Select v-model="filters.type">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="IN">Entrée</SelectItem>
            <SelectItem value="OUT">Sortie</SelectItem>
            <SelectItem value="TRANSFER">Transfert</SelectItem>
            <SelectItem value="SALE">Vente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1"><Label class="text-xs">Du</Label><Input v-model="filters.from" type="date" class="bg-card" /></div>
      <div class="space-y-1"><Label class="text-xs">Au</Label><Input v-model="filters.to" type="date" class="bg-card" /></div>
    </FilterBar>

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Coût unit.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-else-if="!movements.length">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Aucun mouvement</TableCell>
          </TableRow>
          <TableRow v-for="m in movements" :key="m.id">
            <TableCell>{{ (m.moved_at || m.created_at || '').split('T')[0] }}</TableCell>
            <TableCell>{{ m.type }}</TableCell>
            <TableCell>{{ m.product?.name || '—' }}</TableCell>
            <TableCell>{{ m.stock?.name || '—' }}</TableCell>
            <TableCell>{{ m.quantity }}</TableCell>
            <TableCell>{{ formatFbu(m.unit_cost) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
