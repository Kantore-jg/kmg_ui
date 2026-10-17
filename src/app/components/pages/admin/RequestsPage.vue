<script setup>
import { ref, computed } from 'vue';
import { FileText, Search } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import Input from '../../ui/Input.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import RequestsTable from '../../requests/RequestsTable.vue';

const { updateRequestStatus } = useApp();
const { scopedRequests, scopedMarkets, isMarketOwner } = useAdminScope();

const searchQuery = ref('');
const statusFilter = ref('all');

const filteredRequests = computed(() =>
  scopedRequests.value.filter((r) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      r.merchantName.toLowerCase().includes(q) ||
      r.activityType.toLowerCase().includes(q);
    const matchesStatus = statusFilter.value === 'all' || r.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  }),
);

const pendingCount = computed(() =>
  scopedRequests.value.filter((r) => r.status === 'pending').length,
);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Gestion Des Demandes"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Total dossiers" :value="scopedRequests.length" :icon="FileText" color="primary" />
      <StatCard title="En attente" :value="pendingCount" :icon="FileText" color="warning" />
      <StatCard
        title="Traités"
        :value="scopedRequests.length - pendingCount"
        :icon="FileText"
        color="success"
      />
    </div>

    <FilterBar :show-clear="searchQuery || statusFilter !== 'all'" @clear="searchQuery = ''; statusFilter = 'all'">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Candidat, activité..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full sm:w-44">
        <label class="text-xs font-medium text-muted-foreground">Statut</label>
        <Select v-model="statusFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvé</SelectItem>
            <SelectItem value="rejected">Rejeté</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <RequestsTable
      :requests="filteredRequests"
      :markets="scopedMarkets"
      :loading="false"
      :readonly="isMarketOwner"
      @approve="updateRequestStatus($event.id, 'approved')"
      @reject="updateRequestStatus($event.id, 'rejected')"
    />
  </div>
</template>
