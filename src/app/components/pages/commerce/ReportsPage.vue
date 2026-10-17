<script setup>
import { ref, watch } from 'vue';
import { fetchCommerceReport } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import Button from '../../ui/Button.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();

const tabs = [
  { id: 'sales', label: 'Ventes', apiType: 'sales' },
  { id: 'stock', label: 'Stock', apiType: 'stock' },
  { id: 'financial', label: 'Financier', apiType: 'financial' },
  { id: 'benefits', label: 'Bénéfices', apiType: 'benefits' },
];

const activeTab = ref('sales');
const report = ref(null);
const loading = ref(false);
const filters = ref({
  from: '',
  to: '',
});

async function loadReport() {
  loading.value = true;
  try {
    const tab = tabs.find((t) => t.id === activeTab.value);
    const params = {};
    if (filters.value.from) params.from = filters.value.from;
    if (filters.value.to) params.to = filters.value.to;
    report.value = await fetchCommerceReport(tab.apiType, params);
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    report.value = null;
  } finally {
    loading.value = false;
  }
}

watch([activeTab, filters], () => { void loadReport(); }, { deep: true, immediate: true });
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Rapports" subtitle="Analyses et statistiques" />

    <div class="flex flex-wrap gap-2">
      <Button
        v-for="tab in tabs"
        :key="tab.id"
        :variant="activeTab === tab.id ? 'default' : 'outline'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </Button>
    </div>

    <div class="flex flex-wrap gap-4">
      <div class="space-y-1"><Label class="text-xs">Du</Label><Input v-model="filters.from" type="date" class="bg-card w-40" /></div>
      <div class="space-y-1"><Label class="text-xs">Au</Label><Input v-model="filters.to" type="date" class="bg-card w-40" /></div>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">Chargement du rapport...</div>

    <template v-else-if="report">
      <!-- Sales / Benefits -->
      <template v-if="activeTab === 'sales' || activeTab === 'benefits'">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card v-if="activeTab === 'sales'">
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Nombre de ventes</CardTitle></CardHeader>
            <CardContent><p class="text-2xl font-bold">{{ report.summary?.sales_count ?? 0 }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Chiffre d'affaires</CardTitle></CardHeader>
            <CardContent><p class="text-2xl font-bold">{{ formatFbu(report.summary?.total_revenue ?? report.summary?.revenue) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Coût total</CardTitle></CardHeader>
            <CardContent><p class="text-2xl font-bold">{{ formatFbu(report.summary?.total_cost ?? report.summary?.cost) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">{{ activeTab === 'benefits' ? 'Bénéfice brut' : 'Marge brute' }}</CardTitle></CardHeader>
            <CardContent><p class="text-2xl font-bold text-success">{{ formatFbu(report.summary?.gross_margin) }}</p></CardContent>
          </Card>
          <Card v-if="activeTab === 'benefits' && report.summary?.margin_rate != null">
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Taux de marge</CardTitle></CardHeader>
            <CardContent><p class="text-2xl font-bold">{{ report.summary.margin_rate }} %</p></CardContent>
          </Card>
        </div>

        <Card v-if="report.by_payment_method?.length">
          <CardHeader><CardTitle class="text-base">Par mode de paiement</CardTitle></CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mode</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead class="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in report.by_payment_method" :key="row.payment_method">
                  <TableCell>{{ row.payment_method }}</TableCell>
                  <TableCell>{{ row.count }}</TableCell>
                  <TableCell class="text-right">{{ formatFbu(row.amount) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </template>

      <!-- Stock -->
      <template v-else-if="activeTab === 'stock'">
        <Card v-if="report.inventory?.length">
          <CardHeader><CardTitle class="text-base">Inventaire actuel</CardTitle></CardHeader>
          <CardContent class="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead class="text-right">Valeur capital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, i) in report.inventory" :key="i">
                  <TableCell>{{ row.stock_name }}</TableCell>
                  <TableCell>{{ row.product_name }}</TableCell>
                  <TableCell>{{ row.quantity }}</TableCell>
                  <TableCell class="text-right">{{ formatFbu(row.capital_value) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </template>

      <!-- Financial -->
      <template v-else-if="activeTab === 'financial'">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Ventes caisse</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold">{{ formatFbu(report.totals?.sales) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Entrées</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold">{{ formatFbu(report.totals?.cash_in) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Flux net</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold text-primary">{{ formatFbu(report.net_cash_flow) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Sorties</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold">{{ formatFbu(report.totals?.cash_out) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Dépenses</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold">{{ formatFbu(report.totals?.expenses) }}</p></CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Retraits</CardTitle></CardHeader>
            <CardContent><p class="text-xl font-bold">{{ formatFbu(report.totals?.withdrawals) }}</p></CardContent>
          </Card>
        </div>
      </template>
    </template>
  </div>
</template>
