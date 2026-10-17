<script setup>
import { ref, computed } from 'vue';
import { Coins, Plus, Search, ExternalLink } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import ReceiptFormDialog from '../../receipts/ReceiptFormDialog.vue';
import Badge from '../../ui/Badge.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

const { addPaymentReceipt, updateReceiptStatus } = useApp();
const {
  isMerchant,
  isMarketOwner,
  scopedReceipts,
  scopedPlaces,
  assignedMerchant,
  findMarket,
} = useAdminScope();

const searchQuery = ref('');
const statusFilter = ref('all');
const formOpen = ref(false);
const canValidateReceipts = computed(() => !isMerchant.value && !isMarketOwner.value);

const filteredReceipts = computed(() =>
  scopedReceipts.value.filter((r) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      r.merchantName.toLowerCase().includes(q) ||
      r.month.toLowerCase().includes(q);
    const matchesStatus = statusFilter.value === 'all' || r.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  }),
);

const pendingCount = computed(() =>
  scopedReceipts.value.filter((r) => r.status === 'pending').length,
);

const approvedTotal = computed(() =>
  scopedReceipts.value
    .filter((r) => r.status === 'approved')
    .reduce((s, r) => s + r.amount, 0),
);

const pageTitle = computed(() =>
  isMerchant.value ? 'Mes reçus de paiement' : 'Reçus de paiement',
);

const statusBadge = (status) => {
  const map = {
    pending: { label: 'En attente', variant: 'secondary' },
    approved: { label: 'Validé', variant: 'default' },
    rejected: { label: 'Rejeté', variant: 'destructive' },
  };
  return map[status] || { label: status, variant: 'secondary' };
};

const handleReceiptSubmit = (payload) => {
  addPaymentReceipt(payload);
};

const merchantMarketName = computed(() => {
  if (!assignedMerchant.value) return 'Marché';
  return findMarket(assignedMerchant.value.activeMarketId)?.name || 'Marché';
});

const formatRegistrationDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    // ISO date-only string YYYY-MM-DD
    const parts = String(value).split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString(
        'fr-FR',
        { day: '2-digit', month: 'short', year: 'numeric' },
      );
    }
    return value;
  }
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="isMerchant ? 'Gestion De Mes Reçus' : 'Gestion Des Reçus'"
      :action-label="isMerchant ? 'Transmettre un reçu' : ''"
      :action-icon="Plus"
      @action="formOpen = true"
    />
    <!-- subtitle="Suivi des redevances mensuelles des commerçants." -->

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Reçus" :value="scopedReceipts.length" :icon="Coins" color="primary" />
      <StatCard title="En attente" :value="pendingCount" :icon="Coins" color="warning" />
      <StatCard
        title="Montant validé"
        :value="approvedTotal.toLocaleString('fr-FR') + ' BIF'"
        :icon="Coins"
        color="success"
      />
    </div>

    <FilterBar :show-clear="searchQuery || statusFilter !== 'all'" @clear="searchQuery = ''; statusFilter = 'all'">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Commerçant, mois..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full sm:w-44">
        <label class="text-xs font-medium text-muted-foreground">Statut</label>
        <Select v-model="statusFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Validé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <div class="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commerçant</TableHead>
            <TableHead>Mois</TableHead>
            <TableHead>Date d'enregistrement</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Justificatif</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead v-if="canValidateReceipts" class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="!filteredReceipts.length">
            <TableCell :colspan="canValidateReceipts ? 7 : 6" class="text-center py-8 text-muted-foreground">
              Aucun reçu enregistré.
            </TableCell>
          </TableRow>
          <TableRow v-for="r in filteredReceipts" :key="r.id">
            <TableCell class="font-medium">{{ r.merchantName }}</TableCell>
            <TableCell>{{ r.month }}</TableCell>
            <TableCell>{{ formatRegistrationDate(r.submittedDate) }}</TableCell>
            <TableCell>{{ r.amount.toLocaleString('fr-FR') }} BIF</TableCell>
            <TableCell>
              <a
                :href="r.receiptImage"
                target="_blank"
                rel="noreferrer"
                class="text-primary text-sm inline-flex items-center gap-1 hover:underline"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                Voir
              </a>
            </TableCell>
            <TableCell>
              <Badge :variant="statusBadge(r.status).variant">
                {{ statusBadge(r.status).label }}
              </Badge>
            </TableCell>
            <TableCell v-if="canValidateReceipts" class="text-right">
              <div v-if="r.status === 'pending'" class="flex gap-2 justify-end">
                <Button size="sm" variant="outline" @click="updateReceiptStatus(r.id, 'rejected')">
                  Rejeter
                </Button>
                <Button size="sm" @click="updateReceiptStatus(r.id, 'approved')">
                  Valider
                </Button>
              </div>
              <span v-else class="text-xs text-muted-foreground">Traité</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <ReceiptFormDialog
      v-if="isMerchant"
      v-model:open="formOpen"
      :merchant="assignedMerchant"
      :market-name="merchantMarketName"
      :market-id="assignedMerchant?.activeMarketId"
      :places="scopedPlaces"
      @submit="handleReceiptSubmit"
    />
  </div>
</template>