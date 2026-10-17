<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Package,
  MapPin,
  FileText,
  Coins,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Users,
  CalendarDays,
} from 'lucide-vue-next';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { fetchRentSummary } from '../../../../api/services/data.js';
import PageHeader from '../../layout/PageHeader.vue';
import StatCard from '../../StatCard.vue';
import WeeklyBarChart from '../../dashboard/WeeklyBarChart.vue';
import PaymentDonutChart from '../../dashboard/PaymentDonutChart.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import Badge from '../../ui/Badge.vue';
import Button from '../../ui/Button.vue';

const router = useRouter();
const {
  isSuperAdmin,
  isMarketAdmin,
  isMarketOwner,
  isMerchant,
  assignedMerchant,
  scopedMerchants,
  scopedProducts,
  scopedPendingRequests,
  scopedPendingReceipts,
  scopedSalesTotal,
  scopedOccupiedPlaces,
  scopedTotalPlaces,
  scopedFreePlaces,
  scopedOccupationRate,
  scopedMarketOccupation,
  scopedWeeklyReceiptActivity,
  scopedReceiptStatusBreakdown,
  scopedRequests,
  findMarket,
} = useAdminScope();

const rentSummary = ref(null);
const bankColors = ['#2e7d32', '#1565c0', '#f9a825', '#6a1b9a', '#00838f', '#e53935'];

const now = new Date();
const periodLabel = computed(() =>
  now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
);

const rentTotals = computed(() => rentSummary.value?.totals || {
  expected_amount: 0,
  paid_amount: 0,
  unpaid_count: 0,
  late_count: 0,
  paid_count: 0,
});

const bankSegments = computed(() => {
  const rows = rentSummary.value?.by_payment_method || [];
  return rows
    .filter((row) => Number(row.paid_amount) > 0)
    .map((row, index) => ({
      label: row.name || 'Non renseigné',
      value: Number(row.paid_amount || 0),
      color: bankColors[index % bankColors.length],
    }));
});

onMounted(async () => {
  if (isMerchant.value) return;
  try {
    rentSummary.value = await fetchRentSummary({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
  } catch {
    rentSummary.value = null;
  }
});

const merchantPlaceLabel = computed(() => {
  if (!assignedMerchant.value?.activePlaceNumber) return 'Non assigné';
  return `Étal ${assignedMerchant.value.activePlaceNumber}`;
});

const recentRequests = computed(() =>
  [...scopedRequests.value]
    .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
    .slice(0, 5),
);

const statusBadge = (status) => {
  const map = {
    pending: { label: 'En attente', variant: 'secondary' },
    approved: { label: 'Approuvé', variant: 'default' },
    rejected: { label: 'Rejeté', variant: 'destructive' },
  };
  return map[status] || { label: status, variant: 'secondary' };
};

const formatAmount = (n) => Number(n || 0).toLocaleString('fr-FR');
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Tableau de bord" :subtitle="!isMerchant ? periodLabel : ''" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <template v-if="!isMerchant">
        <StatCard
          title="Loyers attendus"
          :value="`${formatAmount(rentTotals.expected_amount)} BIF`"
          :subtitle="periodLabel"
          :icon="CalendarDays"
          color="primary"
        />
        <StatCard
          title="Loyers perçus"
          :value="`${formatAmount(rentTotals.paid_amount)} BIF`"
          :subtitle="`${rentTotals.paid_count} payé(s) · ${rentTotals.late_count + rentTotals.unpaid_count} impayé(s)/retard`"
          :icon="DollarSign"
          color="pink"
        />
      </template>
      <StatCard
        v-else
        title="Mes revenus validés"
        :value="`${formatAmount(scopedSalesTotal)} BIF`"
        :icon="DollarSign"
        color="pink"
      />

      <StatCard
        v-if="!isMerchant"
        title="Étals occupés"
        :value="`${scopedOccupiedPlaces} / ${scopedTotalPlaces}`"
        :icon="MapPin"
        :trend="{ value: scopedOccupationRate + '%', isPositive: true }"
        :subtitle="`${scopedFreePlaces} libre(s)`"
        color="success"
      />
      <StatCard
        v-else
        title="Mon emplacement"
        :value="merchantPlaceLabel"
        :icon="MapPin"
        color="success"
      />

      <StatCard
        v-if="isMerchant"
        title="Mes produits"
        :value="scopedProducts.length"
        :icon="CheckCircle"
        color="success"
      />
      <StatCard
        v-else
        title="Commerçants"
        :value="scopedMerchants.length"
        :icon="Users"
        color="success"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WeeklyBarChart
        title="Activité des 7 derniers jours"
        :data="scopedWeeklyReceiptActivity"
      />

      <PaymentDonutChart
        v-if="!isMerchant"
        title="Paiements par banque"
        :subtitle="periodLabel"
        :segments="bankSegments"
      />
      <PaymentDonutChart
        v-else
        title="Répartition des reçus"
        :segments="scopedReceiptStatusBreakdown"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card v-if="!isMerchant" class="bs-card border shadow-sm">
        <CardHeader>
          <CardTitle class="text-base">Occupation par marché</CardTitle>
          <p class="text-sm text-muted-foreground">Taux d'occupation des emplacements</p>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="market in scopedMarketOccupation"
            :key="market.id"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">{{ market.name }}</span>
              <span class="text-muted-foreground">
                {{ market.occupied }}/{{ market.total }}
              </span>
            </div>
            <div class="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                class="h-full bg-primary rounded-full transition-all"
                :style="{ width: `${market.rate}%` }"
              />
            </div>
          </div>
          <p v-if="!scopedMarketOccupation.length" class="text-sm text-muted-foreground">
            Aucun marché dans votre périmètre.
          </p>
        </CardContent>
      </Card>

      <Card :class="['bs-card border shadow-sm', isMerchant && 'lg:col-span-2']">
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-base">Actions rapides</CardTitle>
            <p class="text-sm text-muted-foreground">Accès direct aux modules</p>
          </div>
          <TrendingUp class="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent class="grid grid-cols-2 gap-3">
          <Button
            v-if="!isMerchant"
            variant="outline"
            class="h-auto py-4 flex flex-col gap-2 rounded-xl"
            @click="router.push('/admin/places')"
          >
            <MapPin class="w-5 h-5" />
            <span class="text-xs">Emplacements</span>
          </Button>
          <Button
            v-if="!isMerchant"
            variant="outline"
            class="h-auto py-4 flex flex-col gap-2 rounded-xl"
            @click="router.push('/admin/rents')"
          >
            <Coins class="w-5 h-5" />
            <span class="text-xs">Loyers</span>
          </Button>
          <Button
            v-if="isMerchant"
            variant="outline"
            class="h-auto py-4 flex flex-col gap-2 rounded-xl"
            @click="router.push('/admin/products')"
          >
            <Package class="w-5 h-5" />
            <span class="text-xs">Produits</span>
          </Button>
          <Button
            v-if="isMarketAdmin || isMarketOwner"
            variant="outline"
            class="h-auto py-4 flex flex-col gap-2 rounded-xl"
            @click="router.push('/admin/requests')"
          >
            <FileText class="w-5 h-5" />
            <span class="text-xs">Demandes ({{ scopedPendingRequests.length }})</span>
          </Button>
          <Button
            variant="outline"
            class="h-auto py-4 flex flex-col gap-2 rounded-xl"
            @click="router.push('/admin/receipts')"
          >
            <Coins class="w-5 h-5" />
            <span class="text-xs">
              {{ isMerchant ? 'Mes reçus' : 'Reçus' }} ({{ scopedPendingReceipts.length }})
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card v-if="isSuperAdmin || isMarketAdmin || isMarketOwner" class="bs-card border shadow-sm">
      <CardHeader>
        <CardTitle class="text-base">Demandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="recentRequests.length" class="space-y-2">
          <div
            v-for="req in recentRequests"
            :key="req.id"
            class="flex items-start justify-between gap-4 p-4 rounded-xl border border-border hover:bg-accent transition-colors"
          >
            <div class="min-w-0">
              <h4 class="font-medium text-sm">{{ req.merchantName }}</h4>
              <p class="text-sm text-muted-foreground truncate">{{ req.activityType }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ findMarket(req.requestedMarketId)?.name }} — {{ req.submittedDate }}
              </p>
            </div>
            <Badge :variant="statusBadge(req.status).variant">
              {{ statusBadge(req.status).label }}
            </Badge>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground py-4">Aucune demande récente.</p>
      </CardContent>
    </Card>
  </div>
</template>
