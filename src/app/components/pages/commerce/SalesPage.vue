<script setup>
import { ref, onMounted } from 'vue';
import { fetchCommerceSales } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Badge from '../../ui/Badge.vue';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();
const sales = ref([]);
const loading = ref(true);

const paymentLabels = {
  cash: 'Espèces',
  mobile_money: 'Mobile money',
  card: 'Carte',
  credit: 'Crédit',
};

onMounted(async () => {
  try {
    sales.value = await fetchCommerceSales();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ventes" subtitle="Historique des ventes" />

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead class="text-right">Montant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-else-if="!sales.length">
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">Aucune vente</TableCell>
          </TableRow>
          <TableRow v-for="sale in sales" :key="sale.id">
            <TableCell>{{ sale.soldAt || sale.createdAt }}</TableCell>
            <TableCell>{{ sale.stockName || '—' }}</TableCell>
            <TableCell>
              <Badge class="bg-primary/10 text-primary border-0">{{ paymentLabels[sale.paymentMethod] || sale.paymentMethod }}</Badge>
            </TableCell>
            <TableCell>
              <span v-for="(item, i) in sale.items" :key="item.id">
                {{ item.productName }} × {{ item.quantity }}<span v-if="i < sale.items.length - 1">, </span>
              </span>
            </TableCell>
            <TableCell class="text-right font-medium">{{ formatFbu(sale.totalAmount) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
