<script setup>
import { ref, onMounted } from 'vue';
import { DollarSign, ShoppingCart, Boxes, TrendingUp, AlertTriangle, Wallet } from 'lucide-vue-next';
import { fetchCommerceDashboard } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import StatCard from '../../StatCard.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();
const kpis = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    kpis.value = await fetchCommerceDashboard();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre commerce" />

    <div v-if="loading" class="text-sm text-muted-foreground">Chargement des indicateurs...</div>

    <template v-else-if="kpis">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="CA du jour" :value="formatFbu(kpis.today_ca)" :icon="DollarSign" color="primary" />
        <StatCard title="Ventes du jour" :value="kpis.sales_count" :icon="ShoppingCart" color="success" />
        <StatCard title="Stock total" :value="`${Number(kpis.stock_qty_sum).toLocaleString('fr-FR')} unités`" :icon="Boxes" color="secondary" />
        <StatCard title="Capital stock" :value="formatFbu(kpis.capital)" :icon="TrendingUp" color="warning" />
        <StatCard title="Valeur de vente" :value="formatFbu(kpis.sale_value)" :icon="DollarSign" color="pink" />
        <StatCard title="Marge potentielle" :value="formatFbu(kpis.margin)" :icon="TrendingUp" color="success" />
        <StatCard title="Solde caisse ouverte" :value="formatFbu(kpis.open_cash_balance)" :icon="Wallet" color="primary" />
      </div>

      <Card v-if="kpis.low_stock_alerts?.length">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <AlertTriangle class="w-5 h-5 text-warning" />
            Alertes stock bas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2">
            <li v-for="alert in kpis.low_stock_alerts" :key="alert.product_id" class="flex justify-between text-sm">
              <span>{{ alert.name }} <span v-if="alert.sku" class="text-muted-foreground">({{ alert.sku }})</span></span>
              <span class="text-destructive font-medium">{{ alert.quantity }} / min {{ alert.min_stock }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
