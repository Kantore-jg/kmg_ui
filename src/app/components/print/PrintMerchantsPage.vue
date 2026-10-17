<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '../../../composables/useApp.js';
import { useAdminScope } from '../../../composables/useAdminScope.js';
import PrintLayout from './PrintLayout.vue';
import { getAdministrativeLocationLabel } from '../../../utils/burundiLocations.js';

const route = useRoute();
const { currentUser } = useApp();
const { scopedMerchants, scopedMarkets, isMarketAdmin, isMarketOwner, assignedMarketId, findMarket } = useAdminScope();

const selectedMarketId = computed(() => {
  if (route.query.market) return route.query.market;
  if (isMarketAdmin.value || isMarketOwner.value) return assignedMarketId.value;
  return null;
});

const market = computed(() =>
  selectedMarketId.value ? findMarket(selectedMarketId.value) : null,
);

const merchants = computed(() => {
  if (!selectedMarketId.value) return scopedMerchants.value;
  return scopedMerchants.value.filter((m) => m.activeMarketId == selectedMarketId.value);
});

const printedAt = computed(() =>
  new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
);

const verifiedCount = computed(() => merchants.value.filter((m) => m.verified).length);

onMounted(() => {
  document.title = `Commerçants — ${market.value?.name || 'Akaguriro'}`;
});
</script>

<template>
  <PrintLayout
    title="Impression — Commerçants"
    back-path="/admin/merchants"
  >
    <div class="print-document">
      <header class="print-document__header">
        <div class="print-document__brand">AKAGURIRO</div>
        <div class="print-document__subtitle">République du Burundi — Rapport officiel</div>
        <h1 class="print-document__title">
          Liste des commerçants
          <template v-if="market"> — {{ market.name }}</template>
        </h1>
        <div class="print-document__meta">
          <span v-if="market"><strong>Marché :</strong> {{ market.name }} ({{ getAdministrativeLocationLabel(market) }})</span>
          <!-- <span><strong>Édité par :</strong> {{ currentUser.name }}</span> -->
          <span><strong>Date :</strong> {{ printedAt }}</span>
        </div>
      </header>

      <div class="print-document__stats">
        <div class="print-document__stat">
          <div class="print-document__stat-label">Total commerçants</div>
          <div class="print-document__stat-value">{{ merchants.length }}</div>
        </div>
        <div class="print-document__stat">
          <div class="print-document__stat-label">Habilités</div>
          <div class="print-document__stat-value">{{ verifiedCount }}</div>
        </div>
        <div class="print-document__stat">
          <div class="print-document__stat-label">Marchés couverts</div>
          <div class="print-document__stat-value">{{ market ? 1 : scopedMarkets.length }}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Étal</th>
            <th>Filière</th>
            <th>Produits</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!merchants.length">
            <td colspan="8" style="text-align:center;color:#9ca3af;padding:2rem">
              Aucun commerçant à afficher.
            </td>
          </tr>
          <tr v-for="(m, idx) in merchants" :key="m.id">
            <td>{{ idx + 1 }}</td>
            <td><strong>{{ m.name }}</strong></td>
            <td>{{ m.phone || '—' }}</td>
            <td>{{ m.email || '—' }}</td>
            <td>{{ m.activePlaceNumber || m.activePlaceId || '—' }}</td>
            <td>{{ m.category }}</td>
            <td>{{ m.productsCount ?? '—' }}</td>
            <td>
              <span :class="m.verified ? 'badge-print badge-print--success' : 'badge-print badge-print--warning'">
                {{ m.verified ? 'Habilité' : 'En attente' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="print-document__footer">
        <span>Document Akaguriro </span>
        <span>{{ printedAt }}</span>
      </footer>
    </div>
  </PrintLayout>
</template>
