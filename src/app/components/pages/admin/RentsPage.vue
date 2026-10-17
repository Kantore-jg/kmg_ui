<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { CalendarDays, Coins, ExternalLink, Landmark } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import {
  fetchRentSummary,
  fetchPaymentMethods,
  approveReceipt,
  rejectReceipt,
} from '../../../../api/services/data.js';
import { getErrorMessage } from '../../../../api/client.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import Badge from '../../ui/Badge.vue';
import Button from '../../ui/Button.vue';
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
const {
  isSuperAdmin,
  isMarketOwner,
  assignedMarketId,
} = useAdminScope();

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const marketFilter = ref(assignedMarketId.value ? String(assignedMarketId.value) : 'all');
const paymentMethodFilter = ref('all');
const statusFilter = ref('all');
const summary = ref(null);
const paymentMethods = ref([]);
const loading = ref(false);

const canValidate = computed(() => !isMarketOwner.value);

const years = computed(() => {
  const current = now.getFullYear();
  return [current - 1, current, current + 1];
});

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
];

const periodLabel = computed(() => {
  const m = months.find((item) => item.value === Number(month.value));
  return `${m?.label || ''} ${year.value}`;
});

const totals = computed(() => summary.value?.totals || {
  expected_amount: 0,
  paid_amount: 0,
  pending_amount: 0,
  unpaid_count: 0,
  late_count: 0,
  paid_count: 0,
  pending_count: 0,
});

const places = computed(() => {
  const rows = summary.value?.places || [];
  if (statusFilter.value === 'all') return rows;
  return rows.filter((row) => row.status === statusFilter.value);
});

const statusMeta = (status) => {
  const map = {
    paid: { label: 'Payé', variant: 'default' },
    pending: { label: 'En attente', variant: 'secondary' },
    unpaid: { label: 'Impayé', variant: 'outline' },
    late: { label: 'En retard', variant: 'destructive' },
  };
  return map[status] || { label: status, variant: 'outline' };
};

const formatAmount = (n) => Number(n || 0).toLocaleString('fr-FR');

async function loadMethods() {
  const params = {};
  if (isSuperAdmin.value && marketFilter.value !== 'all') {
    params.market_id = marketFilter.value;
  } else if (assignedMarketId.value) {
    params.market_id = assignedMarketId.value;
  }
  params.is_active = true;
  paymentMethods.value = await fetchPaymentMethods(params);
}

async function refresh() {
  loading.value = true;
  try {
    const params = {
      year: year.value,
      month: month.value,
    };
    if (isSuperAdmin.value && marketFilter.value !== 'all') {
      params.market_id = marketFilter.value;
    }
    if (paymentMethodFilter.value !== 'all') {
      params.payment_method_id = paymentMethodFilter.value;
    }
    summary.value = await fetchRentSummary(params);
  } catch (error) {
    showToast(getErrorMessage(error, 'Erreur de chargement des loyers'), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await loadMethods();
  } catch {
    paymentMethods.value = [];
  }
  await refresh();
});

watch([year, month, marketFilter, paymentMethodFilter], () => {
  void refresh();
});

watch(marketFilter, async () => {
  paymentMethodFilter.value = 'all';
  try {
    await loadMethods();
  } catch {
    paymentMethods.value = [];
  }
});

const handleApprove = async (receiptId) => {
  try {
    await approveReceipt(receiptId);
    showToast('Paiement validé', 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const handleReject = async (receiptId) => {
  try {
    await rejectReceipt(receiptId, 'Justificatif non conforme');
    showToast('Paiement rejeté', 'error');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Loyers" :subtitle="periodLabel" />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Attendu"
        :value="`${formatAmount(totals.expected_amount)} BIF`"
        :icon="CalendarDays"
        color="primary"
      />
      <StatCard
        title="Perçu"
        :value="`${formatAmount(totals.paid_amount)} BIF`"
        :icon="Coins"
        color="success"
        :subtitle="`${totals.paid_count} payé(s)`"
      />
      <StatCard
        title="En attente"
        :value="`${formatAmount(totals.pending_amount)} BIF`"
        :icon="Coins"
        color="warning"
        :subtitle="`${totals.pending_count} dossier(s)`"
      />
      <StatCard
        title="Impayés / Retard"
        :value="totals.unpaid_count + totals.late_count"
        :icon="Landmark"
        color="pink"
        :subtitle="`${totals.late_count} en retard`"
      />
    </div>

    <FilterBar>
      <div class="space-y-1 w-full sm:w-36">
        <label class="text-xs font-medium text-muted-foreground">Année</label>
        <Select :model-value="String(year)" @update:model-value="year = Number($event)">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="y in years" :key="y" :value="String(y)">{{ y }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full sm:w-44">
        <label class="text-xs font-medium text-muted-foreground">Mois</label>
        <Select :model-value="String(month)" @update:model-value="month = Number($event)">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in months" :key="m.value" :value="String(m.value)">
              {{ m.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="isSuperAdmin" class="space-y-1 w-full sm:w-56">
        <label class="text-xs font-medium text-muted-foreground">Marché</label>
        <Select v-model="marketFilter">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem v-for="m in markets" :key="m.id" :value="String(m.id)">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full sm:w-56">
        <label class="text-xs font-medium text-muted-foreground">Banque</label>
        <Select v-model="paymentMethodFilter">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem v-for="pm in paymentMethods" :key="pm.id" :value="String(pm.id)">
              {{ pm.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full sm:w-44">
        <label class="text-xs font-medium text-muted-foreground">Statut</label>
        <Select v-model="statusFilter">
          <SelectTrigger class="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="paid">Payés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="unpaid">Impayés</SelectItem>
            <SelectItem value="late">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Étal</TableHead>
            <TableHead>Bloc</TableHead>
            <TableHead>Commerçant</TableHead>
            <TableHead>Loyer dû</TableHead>
            <TableHead>Banque</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Justificatif</TableHead>
            <TableHead v-if="canValidate" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="canValidate ? 8 : 7" class="text-center py-8 text-muted-foreground">
              Chargement...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="!places.length">
            <TableCell :colspan="canValidate ? 8 : 7" class="text-center py-8 text-muted-foreground">
              Aucune place occupée pour cette période.
            </TableCell>
          </TableRow>
          <TableRow v-for="row in places" :key="row.place_id">
            <TableCell class="font-medium">{{ row.place_number }}</TableCell>
            <TableCell>{{ row.block_name || '—' }}</TableCell>
            <TableCell>{{ row.merchant_name || '—' }}</TableCell>
            <TableCell>{{ formatAmount(row.rent_amount) }} BIF</TableCell>
            <TableCell>{{ row.receipt?.payment_method_name || '—' }}</TableCell>
            <TableCell>
              <Badge :variant="statusMeta(row.status).variant">
                {{ statusMeta(row.status).label }}
              </Badge>
            </TableCell>
            <TableCell>
              <a
                v-if="row.receipt?.file_url"
                :href="row.receipt.file_url"
                target="_blank"
                rel="noreferrer"
                class="text-primary text-sm inline-flex items-center gap-1 hover:underline"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                Voir
              </a>
              <span v-else class="text-xs text-muted-foreground">—</span>
            </TableCell>
            <TableCell v-if="canValidate" class="text-right">
              <div v-if="row.status === 'pending' && row.receipt?.id" class="flex gap-2 justify-end">
                <Button size="sm" variant="outline" @click="handleReject(row.receipt.id)">
                  Rejeter
                </Button>
                <Button size="sm" @click="handleApprove(row.receipt.id)">
                  Valider
                </Button>
              </div>
              <span v-else class="text-xs text-muted-foreground">—</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
